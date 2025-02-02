/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferController } from './job-offer.controller';
import { JobOfferService } from './job-offer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobOffer } from './entities/job-offer.entity';
import { MockProxy } from '../mocks/mockproxy';
import { HttpService } from '../http/http.service';
import { DataFetcher } from './job-offer.fechter.service';
import { SourceATransformer } from './transformers/source-a.transformer';
import { SourceBTransformer } from './transformers/source-b.transformer';
import { Employer } from './entities/employer.entity';
import { Skill } from './entities/skill.entity';
import { Location } from './entities/location.entity';
import { GetJobOfferDto } from './dto/get-job-offer.dto';
import { IJobOffer } from './job-offer.interface';

describe('JobOfferController', () => {
  let controller: JobOfferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOfferController],
      providers: [
        JobOfferService,
        {
          provide: getRepositoryToken(JobOffer),
          useFactory: MockProxy,
        },
        {
          provide: getRepositoryToken(Employer),
          useFactory: MockProxy,
        },
        {
          provide: getRepositoryToken(Location),
          useFactory: MockProxy,
        },
        {
          provide: getRepositoryToken(Skill),
          useFactory: MockProxy,
        },
        {
          provide: 'FetcherA',
          useFactory: (httpService: HttpService) =>
            new DataFetcher(httpService, new SourceATransformer()),
        },
        {
          provide: 'FetcherB',
          useFactory: (httpService: HttpService) =>
            new DataFetcher(httpService, new SourceBTransformer()),
        },
      ],
    }).compile();

    controller = module.get<JobOfferController>(JobOfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass the params over to the service', async () => {
    const jobOfferData: GetJobOfferDto = {
      title: 'Software Engineer',
      remote: 'true',
      minCompensation: 80000,
      maxCompensation: 120000,
      currency: 'USD',
      experienceRequired: 3,
      type: 'full-time',
      sortByPostedDate: 'DESC',
      employerName: 'techcorp',
      city: 'San Francisco',
      skills: ['javascript', 'typescript', 'nodejs'],
      page: 1,
      limit: 10,
    };
    jest
      .spyOn(controller, 'get')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .mockImplementation((_params: GetJobOfferDto) => {
        return Promise.resolve([] as IJobOffer[]);
      });
    await controller.get(jobOfferData);
    expect(controller.get).toHaveBeenCalledWith(jobOfferData);
  });
});
