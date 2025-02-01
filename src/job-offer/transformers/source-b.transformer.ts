import { Injectable } from '@nestjs/common';
import { DataTransformer } from './transformer.interface';
import { IJobOffer } from '../job-offer.interface';
import { SourceBJob, SourceBResults } from './source-b.interface';

@Injectable()
export class SourceBTransformer implements DataTransformer<SourceBResults> {
  transform(data: SourceBResults): IJobOffer[] {
    if (!data.data?.jobsList) return [];

    const transformed: IJobOffer[] = Object.entries(data.data.jobsList).map(
      ([jobId, job]) => {
        return {
          externalId: jobId,
          provider: 'sourceB',
          title: job.position,
          remote: job.location?.remote,
          minCompensation: job.compensation?.min,
          maxCompensation: job.compensation?.max,
          currency: job.compensation?.currency,
          experienceRequired: job.requirements?.experience,
          datePosted: job.datePosted ? new Date(job.datePosted) : undefined,
          location: job.location
            ? {
                state: job.location?.state,
                city: job.location?.city,
              }
            : undefined,
          employer: {
            companyName: job.employer.companyName,
            website: job.employer.website,
          },
          skills: this.getSkills(job),
        };
      },
    );
    return transformed;
  }

  private getSkills(job: SourceBJob): { name: string }[] | undefined {
    if (!job.requirements?.technologies) return undefined;
    return job.requirements?.technologies.map((s) => ({ name: s }));
  }
}
