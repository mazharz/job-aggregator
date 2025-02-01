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
});
