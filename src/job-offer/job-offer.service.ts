import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobOffer } from './entities/job-offer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JobOfferService {
  constructor(
    @InjectRepository(JobOffer)
    private jobOfferRepository: Repository<JobOffer>,
  ) {}

  async create() {}
}
