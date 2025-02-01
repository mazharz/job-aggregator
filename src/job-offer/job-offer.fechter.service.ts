import { Injectable } from '@nestjs/common';
import { HttpService } from '../http/http.service';
import { DataTransformer } from './transformers/transformer.interface';
import { IJobOffer } from './job-offer.interface';

@Injectable()
export class DataFetcher<T> {
  constructor(
    private readonly httpService: HttpService,
    private readonly transformer: DataTransformer<T>,
  ) {}

  async fetchAndTransform(url: string): Promise<IJobOffer[]> {
    const response = await this.httpService.get<T>(url);
    return this.transformer.transform(response);
  }
}
