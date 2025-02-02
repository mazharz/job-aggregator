import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobOffer } from './entities/job-offer.entity';
import { In, Repository } from 'typeorm';
import {
  IEmployer,
  IInsertedJobOffer,
  IJobOffer,
  ILocation,
} from './job-offer.interface';
import { isFulfilled, isRejected } from '../helpers/promise';
import { SourceAResults } from './transformers/source-a.interface';
import { SourceBResults } from './transformers/source-b.interface';
import { DataFetcher } from './job-offer.fechter.service';
import { Employer } from './entities/employer.entity';
import { Location } from './entities/location.entity';
import { Skill } from './entities/skill.entity';
import { GetJobOfferDto } from './dto/get-job-offer.dto';

@Injectable()
export class JobOfferService {
  private readonly logger = new Logger(JobOfferService.name);

  constructor(
    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @Inject('FetcherA')
    private readonly fetcherA: DataFetcher<SourceAResults>,
    @Inject('FetcherB')
    private readonly fetcherB: DataFetcher<SourceBResults>,
  ) {}

  async aggregateData() {
    const promises = await Promise.allSettled([
      this.fetcherA.fetchAndTransform(
        'https://assignment.devotel.io/api/provider1/jobs',
      ),
      this.fetcherB.fetchAndTransform(
        'https://assignment.devotel.io/api/provider2/jobs',
      ),
    ]);

    // log the failed ones
    promises.filter(isRejected).forEach((p) => {
      this.logger.error('Job offer provider failed', JSON.stringify(p.reason));
    });

    const data = promises.filter(isFulfilled).flatMap((p) => p.value);
    const result = this.storeJobOffers(data);

    return result;
  }

  async storeJobOffers(data: IJobOffer[]): Promise<{ inserted: number }> {
    const employersMap = new Map<string, IEmployer>();
    const locationsMap = new Map<string, ILocation>();
    const skillsSet = new Set<string>();

    // Collect unique entities
    data.forEach((job) => {
      if (job.employer.companyName)
        employersMap.set(job.employer.companyName, job.employer);
      if (job.location?.city) locationsMap.set(job.location.city, job.location);
      job.skills?.forEach((skill) => skillsSet.add(skill.name));
    });

    // Fetch existing records from the database
    const [existingEmployers, existingLocations, existingSkills] =
      await Promise.all([
        this.employerRepository.find({
          where: { companyName: In([...employersMap.keys()]) },
        }),
        this.locationRepository.find({
          where: { city: In([...locationsMap.keys()]) },
        }),
        this.skillRepository.find({ where: { name: In([...skillsSet]) } }),
      ]);

    // Convert existing entities into maps for quick lookup
    const existingEmployerMap = new Map(
      existingEmployers.map((e) => [e.companyName, e]),
    );
    const existingLocationMap = new Map(
      existingLocations.map((l) => [l.city, l]),
    );
    const existingSkillsMap = new Map(existingSkills.map((s) => [s.name, s]));

    // Filter out new entries that don't exist in the DB
    const newEmployers = [...employersMap.values()].filter(
      (e) => !existingEmployerMap.has(e.companyName),
    );
    const newLocations = [...locationsMap.values()].filter(
      (l) => !existingLocationMap.has(l.city),
    );
    const newSkills = [...skillsSet]
      .filter((s) => !existingSkillsMap.has(s))
      .map((name) => ({ name }));

    // Insert new employers, locations, and skills
    const [employerInsert, locationInsert, skillInsert] = await Promise.all([
      this.employerRepository.insert(newEmployers),
      this.locationRepository.insert(newLocations),
      this.skillRepository.insert(newSkills),
    ]);

    // Update maps with newly inserted records
    newEmployers.forEach((e, idx) =>
      existingEmployerMap.set(e.companyName, {
        ...e,
        id: employerInsert.identifiers[idx].id as number,
      }),
    );
    newLocations.forEach((l, idx) =>
      existingLocationMap.set(l.city, {
        ...l,
        id: locationInsert.identifiers[idx].id as number,
      }),
    );
    newSkills.forEach((s, idx) =>
      existingSkillsMap.set(s.name, {
        ...s,
        id: skillInsert.identifiers[idx].id as number,
      }),
    );

    // Prepare job offers for insertion
    const jobOffersToInsert = data.map((o) => ({
      ...o,
      employer: existingEmployerMap.get(o.employer.companyName),
      location: o.location?.city
        ? existingLocationMap.get(o.location.city)
        : undefined,
      skills:
        o.skills
          ?.map((s) => existingSkillsMap.get(s.name))
          .filter((s) => !!s) ?? undefined,
    }));

    // Insert job offers
    const insertedJobOffers: IInsertedJobOffer = await this.jobOfferRepository
      .createQueryBuilder()
      .insert()
      .into(JobOffer)
      .values(jobOffersToInsert)
      .orIgnore()
      .returning(['id', 'externalId', 'provider'])
      .execute();

    // create mappings between job offers and skills
    const jobOfferSkillRelations = insertedJobOffers.raw
      .flatMap((insertedOffer) => {
        const matchingJobOfferWithSkillData = jobOffersToInsert.find(
          (o) =>
            o.externalId === insertedOffer.externalId &&
            o.provider === insertedOffer.provider,
        );

        if (
          !matchingJobOfferWithSkillData ||
          !matchingJobOfferWithSkillData.skills
        ) {
          return null;
        }

        const skills = matchingJobOfferWithSkillData.skills
          .filter((s) => s.name && s.id)
          .map((s) => ({
            jobOfferId: insertedOffer.id,
            skillId: s.id,
          }));
        return skills;
      })
      .filter((o) => o !== null);

    await this.jobOfferRepository
      .createQueryBuilder()
      .insert()
      .into('job_offer_skills_skill')
      .values(jobOfferSkillRelations)
      .execute();

    return {
      inserted: insertedJobOffers.raw.length,
    };
  }

  async getJobOffers(getJobOffersDto: GetJobOfferDto): Promise<IJobOffer[]> {
    const query = this.jobOfferRepository
      .createQueryBuilder('job_offer')
      .leftJoinAndSelect('job_offer.employer', 'employer')
      .leftJoinAndSelect('job_offer.location', 'location')
      .leftJoinAndSelect('job_offer.skills', 'skill');

    const {
      title,
      remote,
      minCompensation,
      maxCompensation,
      currency,
      experienceRequired,
      type,
      sortByPostedDate,
      employerName,
      skills,
    } = getJobOffersDto;

    if (title) {
      query.andWhere('job_offer.title ILIKE :title', { title: `%${title}%` });
    }

    if (remote) {
      query.andWhere('job_offer.remote = :remote', { remote });
    }

    if (minCompensation) {
      query.andWhere('job_offer.minCompensation >= :minCompensation', {
        minCompensation,
      });
    }

    if (maxCompensation) {
      query.andWhere('job_offer.maxCompensation <= :maxCompensation', {
        maxCompensation,
      });
    }

    if (currency) {
      query.andWhere('job_offer.currency ILIKE :currency', {
        currency: `%${currency}%`,
      });
    }

    if (experienceRequired) {
      query.andWhere('job_offer.experienceRequired <= :experienceRequired', {
        experienceRequired,
      });
    }

    if (type) {
      query.andWhere('job_offer.type ILIKE :type', { type: `%${type}%` });
    }

    if (employerName) {
      query.andWhere('employer.companyName ILIKE :employerName', {
        employerName: `%${employerName}%`,
      });
    }

    if (skills) {
      query.andWhere('skill.name IN (:...skills)', { skills });
    }

    if (sortByPostedDate) {
      query.orderBy('job_offer.datePosted', sortByPostedDate);
    }

    const data = await query.getMany();
    return data;
  }
}
