import { Controller, Get, Post } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';

@Controller('job-offer')
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  @Post()
  async create() {
    const result = await this.jobOfferService.aggregateData();
    return result;
  }

  @Get()
  async get() {
    const result = await this.jobOfferService.getJobOffers();
    return result;
  }
}
