import { Module } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { JobOfferController } from './job-offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffer } from './entities/job-offer.entity';
import { DataFetcher } from './job-offer.fechter.service';
import { SourceATransformer } from './transformers/source-a.transformer';
import { SourceBTransformer } from './transformers/source-b.transformer';
import { HttpService } from 'src/http/http.service';
import { Employer } from './entities/employer.entity';
import { Location } from './entities/location.entity';
import { Skill } from './entities/skill.entity';
import { JobOfferJobs } from './job-offer.job';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer, Employer, Location, Skill])],
  controllers: [JobOfferController],
  providers: [
    JobOfferService,
    JobOfferJobs,
    {
      provide: 'FetcherA',
      useFactory: (httpService: HttpService) =>
        new DataFetcher(httpService, new SourceATransformer()),
      inject: [HttpService],
    },
    {
      provide: 'FetcherB',
      useFactory: (httpService: HttpService) =>
        new DataFetcher(httpService, new SourceBTransformer()),
      inject: [HttpService],
    },
  ],
})
export class JobOfferModule {}
