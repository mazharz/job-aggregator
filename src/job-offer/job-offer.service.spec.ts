import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferService } from './job-offer.service';
import { DataFetcher } from './job-offer.fechter.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobOffer } from './entities/job-offer.entity';
import { MockProxy } from '../mocks/mockproxy';
import { Employer } from './entities/employer.entity';
import { Location } from './entities/location.entity';
import { Skill } from './entities/skill.entity';
import { SourceAResults } from './transformers/source-a.interface';
import { SourceBResults } from './transformers/source-b.interface';

describe('JobOfferService', () => {
  let service: JobOfferService;
  let fetcherA: DataFetcher<SourceAResults>;
  let fetcherB: DataFetcher<SourceBResults>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          useFactory: MockProxy,
        },
        {
          provide: 'FetcherB',
          useFactory: MockProxy,
        },
      ],
    }).compile();

    service = module.get<JobOfferService>(JobOfferService);
    fetcherA = module.get<DataFetcher<SourceAResults>>('FetcherA');
    fetcherB = module.get<DataFetcher<SourceBResults>>('FetcherB');
  });

  describe('aggregateData', () => {
    it('should log failed promises', async () => {
      jest
        .spyOn(fetcherA, 'fetchAndTransform')
        .mockRejectedValue(new Error('i was rejected'));
      jest
        .spyOn(fetcherB, 'fetchAndTransform')
        .mockRejectedValue(new Error('i was rejected'));
      jest.spyOn(service.logger, 'error').mockImplementation(() => {});
      jest.spyOn(service, 'storeJobOffers').mockImplementation();
      await service.aggregateData();
      expect(service.logger.error).toHaveBeenNthCalledWith(
        2,
        'Job offer provider failed',
        Error('i was rejected'),
      );
    });
    it('should pass on the received job offers for storage', async () => {
      const jobOffers = [
        {
          externalId: '1',
          provider: 'a',
          title: 'a',
          employer: { companyName: 'a' },
        },
        {
          externalId: '2',
          provider: 'a',
          title: 'b',
          employer: { companyName: 'b' },
        },
        {
          externalId: '1',
          provider: 'b',
          title: 'b',
          employer: { companyName: 'b' },
        },
      ];
      jest
        .spyOn(fetcherA, 'fetchAndTransform')
        .mockResolvedValue(jobOffers.slice(0, 2));
      jest
        .spyOn(fetcherB, 'fetchAndTransform')
        .mockResolvedValue(jobOffers.slice(2, 3));
      jest.spyOn(service.logger, 'error').mockImplementation(() => {});
      jest.spyOn(service, 'storeJobOffers').mockImplementation();
      await service.aggregateData();
      expect(service.storeJobOffers).toHaveBeenCalledWith(jobOffers);
    });
  });
});
