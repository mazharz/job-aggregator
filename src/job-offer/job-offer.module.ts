import { Module } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { JobOfferController } from './job-offer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffer } from './entities/job-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer])],
  controllers: [JobOfferController],
  providers: [JobOfferService],
})
export class JobOfferModule {}
