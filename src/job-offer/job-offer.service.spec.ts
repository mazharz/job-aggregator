import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferService } from './job-offer.service';
import { HttpService } from '../http/http.service';
import { DataFetcher } from './job-offer.fechter.service';
import { SourceATransformer } from './transformers/source-a.transformer';
import { SourceBTransformer } from './transformers/source-b.transformer';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobOffer } from './entities/job-offer.entity';
import { MockProxy } from '../mocks/mockproxy';

describe('JobOfferService', () => {
  let service: JobOfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<JobOfferService>(JobOfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
