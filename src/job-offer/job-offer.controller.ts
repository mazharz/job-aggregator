import { Controller, Post } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';

@Controller('job-offer')
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  @Post()
  create() {
    return 'hi';
    // return this.jobOfferService.create();
  }
}
