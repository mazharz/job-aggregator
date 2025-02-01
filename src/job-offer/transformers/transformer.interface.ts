import { IJobOffer } from '../job-offer.interface';

export interface DataTransformer<T> {
  transform(data: T): IJobOffer[];
}
