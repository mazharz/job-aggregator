import { Controller, Get, Query } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { GetJobOfferDto } from './dto/get-job-offer.dto';
import { IJobOffer } from './job-offer.interface';
import { ApiResponse } from '@nestjs/swagger';

@Controller('job-offer')
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'The results are fetched successfully.',
    example: {
      id: 63,
      externalId: 'job-840',
      provider: 'sourceB',
      title: 'Backend Engineer',
      remote: false,
      minCompensation: 52000,
      maxCompensation: 80000,
      currency: 'USD',
      experienceRequired: 5,
      type: null,
      datePosted: '2025-01-30T00:00:00.000Z',
      employer: {
        id: 1,
        companyName: 'BackEnd Solutions',
        website: null,
        industry: 'Analytics',
      },
      location: {
        id: 3,
        state: 'WA',
        city: 'New York',
      },
      skills: [
        {
          id: 4,
          name: 'HTML',
        },
      ],
    },
  })
  async get(@Query() getJobOffersDto: GetJobOfferDto): Promise<IJobOffer[]> {
    const result = await this.jobOfferService.getJobOffers(getJobOffersDto);
    return result;
  }
}
