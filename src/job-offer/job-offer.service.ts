import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobOffer } from './entities/job-offer.entity';
import { In, Repository } from 'typeorm';
import { IEmployer, IJobOffer, ILocation } from './job-offer.interface';
import { isFulfilled, isRejected } from '../helpers/promise';
import { SourceAResults } from './transformers/source-a.interface';
import { SourceBResults } from './transformers/source-b.interface';
import { DataFetcher } from './job-offer.fechter.service';
import { Employer } from './entities/employer.entity';
import { Location } from './entities/location.entity';
import { Skill } from './entities/skill.entity';

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

  async storeJobOffers(data: IJobOffer[]): Promise<{
    inserted: number;
    duplicates: number;
  }> {
    const employersMap = new Map<string, IEmployer>();
    const locationsMap = new Map<string, ILocation>();
    const skillsSet = new Set<string>();
    const jobOffersMap = new Map<string, IJobOffer>();

    // Collect unique entities
    data.forEach((job) => {
      if (job.employer.companyName)
        employersMap.set(job.employer.companyName, job.employer);
      if (job.location?.city) locationsMap.set(job.location.city, job.location);
      job.skills?.forEach((skill) => skillsSet.add(skill.name));
      jobOffersMap.set(`${job.provider}-${job.externalId}`, job);
    });

    // Fetch existing records from the database
    const [
      existingEmployers,
      existingLocations,
      existingSkills,
      existingJobOffers,
    ] = await Promise.all([
      this.employerRepository.find({
        where: { companyName: In([...employersMap.keys()]) },
      }),
      this.locationRepository.find({
        where: { city: In([...locationsMap.keys()]) },
      }),
      this.skillRepository.find({ where: { name: In([...skillsSet]) } }),
      this.jobOfferRepository.find({
        where: {
          externalId: In(
            [...jobOffersMap.keys()].map((key) => key.split('-')[1]),
          ),
        },
      }),
    ]);

    // Convert existing entities into maps for quick lookup
    const existingEmployerMap = new Map(
      existingEmployers.map((e) => [e.companyName, e]),
    );
    const existingLocationMap = new Map(
      existingLocations.map((l) => [l.city, l]),
    );
    const existingSkillsMap = new Map(existingSkills.map((s) => [s.name, s]));
    const existingJobOffersMap = new Map(
      existingJobOffers.map((o) => [`${o.provider}-${o.externalId}`, o]),
    );

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
    const newJobOffers = [...jobOffersMap.values()].filter(
      (o) => !existingJobOffersMap.has(`${o.provider}-${o.externalId}`),
    );

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
    const jobOffersToInsert = newJobOffers.map((o) => ({
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
    const jobOfferInsert =
      await this.jobOfferRepository.insert(jobOffersToInsert);

    // Handle job-offer-skill relations
    const jobOfferSkillRelations = jobOffersToInsert.flatMap((o, idx) =>
      o.skills
        ?.filter((s) => s?.name && s?.id)
        .map((s) => ({
          jobOfferId: jobOfferInsert.identifiers[idx].id as number,
          skillId: s.id,
        }))
        .filter((s) => s.skillId && s.jobOfferId),
    );

    await this.jobOfferRepository
      .createQueryBuilder()
      .insert()
      .into('job_offer_skills_skill')
      .values(jobOfferSkillRelations)
      .execute();

    return {
      inserted: jobOffersToInsert.length,
      duplicates: data.length - jobOffersToInsert.length,
    };
  }

  async getJobOffers(): Promise<IJobOffer[]> {
    const results = await this.jobOfferRepository.find({
      relations: ['employer', 'location', 'skills'],
      order: { datePosted: 'DESC' }, // Sort by newest first
    });

    return results;
  }
}
