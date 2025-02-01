import { Injectable } from '@nestjs/common';
import { SourceAResults } from './source-a.interface';
import { DataTransformer } from './transformer.interface';
import { IJobOffer } from '../job-offer.interface';

@Injectable()
export class SourceATransformer implements DataTransformer<SourceAResults> {
  transform(data: SourceAResults): IJobOffer[] {
    // TODO
    return [];
  }
}
