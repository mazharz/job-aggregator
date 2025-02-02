import { Injectable, Logger } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class JobOfferJobs {
  private readonly logger = new Logger(JobOfferJobs.name);

  constructor(private jobOfferService: JobOfferService) {}

  @Cron(process.env.JOB_FETCH_FREQUENCY ?? '0 0 * * * *')
  async sendObjectSuggestionEmails() {
    try {
      this.logger.log('Run job for fetching job offers');
      const results = await this.jobOfferService.aggregateData();
      this.logger.log(
        `Fetching job offers done, inserted: ${results.inserted}.`,
      );
    } catch (error) {
      this.logger.error(
        'An error happened during job offer aggregation',
        error,
      );
    }
  }
}
