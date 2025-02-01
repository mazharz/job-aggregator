import { Module } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { JobOfferController } from './job-offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffer } from './entities/job-offer.entity';
import { DataFetcher } from './job-offer.fechter.service';
import { SourceATransformer } from './transformers/source-a.transformer';
import { SourceBTransformer } from './transformers/source-b.transformer';
import { HttpService } from 'src/http/http.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer])],
  controllers: [JobOfferController],
  providers: [
    JobOfferService,
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
})
export class JobOfferModule {}
