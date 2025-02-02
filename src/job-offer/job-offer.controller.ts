import { Controller, Get, Post, Query } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { GetJobOfferDto } from './dto/get-job-offer.dto';

@Controller('job-offer')
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  @Post()
  async create() {
    const result = await this.jobOfferService.aggregateData();
    return result;
  }

  @Get()
  async get(@Query() getJobOffersDto: GetJobOfferDto) {
    const result = await this.jobOfferService.getJobOffers(getJobOffersDto);
    return result;
  }
}
