import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobOffer } from './entities/job-offer.entity';
import { Repository } from 'typeorm';
import { IJobOffer } from './job-offer.interface';
import { isFulfilled, isRejected } from 'src/helpers/promise';
import { SourceAResults } from './transformers/source-a.interface';
import { SourceBResults } from './transformers/source-b.interface';
import { DataFetcher } from './job-offer.fechter.service';

@Injectable()
export class JobOfferService {
  private readonly logger = new Logger(JobOfferService.name);

  constructor(
    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,
    @Inject('FetcherA')
    private readonly fetcherA: DataFetcher<SourceAResults>,
    @Inject('FetcherB')
    private readonly fetcherB: DataFetcher<SourceBResults>,
  ) {}

  async aggregateData(): Promise<IJobOffer[]> {
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
    return data;
  }
}
