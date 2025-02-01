import { Controller, Post } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { HttpService } from 'src/http/http.service';

@Controller('job-offer')
export class JobOfferController {
  constructor(
    private readonly jobOfferService: JobOfferService,
    private readonly httpService: HttpService,
  ) {}

  @Post()
  async create() {
    console.log('making requst now');
    const result = await this.httpService.get(
      'https://aflkajsdajads.com/api/afklajd',
    );
    console.log('result was', result);
    return 'hi';
    // return this.jobOfferService.create();
  }
}
