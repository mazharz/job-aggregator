import { Injectable } from '@nestjs/common';
import { DataTransformer } from './transformer.interface';
import { IJobOffer } from '../job-offer.interface';
import { SourceBResults } from './source-b.interface';

@Injectable()
export class SourceBTransformer implements DataTransformer<SourceBResults> {
  transform(data: SourceBResults): IJobOffer[] {
    // TODO
    return [];
  }
}
