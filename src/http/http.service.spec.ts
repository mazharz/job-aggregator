/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { HttpService } from './http.service';
// eslint-disable-next-line no-restricted-imports
import { HttpService as NestHttpService } from '@nestjs/axios';
import { MockProxy } from '../mocks/mockproxy';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';

describe('HttpService', () => {
  let httpService: HttpService;
  let nestHttpService: NestHttpService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HttpService,
        {
          provide: NestHttpService,
          useFactory: MockProxy,
        },
      ],
    }).compile();

    httpService = moduleRef.get<HttpService>(HttpService);
    nestHttpService = moduleRef.get<NestHttpService>(NestHttpService);
  });

  it('should return result if all is well', async () => {
    const mockResponse: AxiosResponse<string> = {
      data: 'Success',
      status: 200,
      statusText: 'OK',
      headers: {},
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      config: {} as any,
    };

    jest.spyOn(nestHttpService, 'get').mockReturnValue(of(mockResponse));
    const result = await httpService.get('http://url.com');
    expect(result).toBe('Success');
    expect(nestHttpService.get).toHaveBeenCalledWith('http://url.com', {});
  });

  it('should retry on failure and eventually throw error', async () => {
    jest
      .spyOn(nestHttpService, 'get')
      .mockReturnValue(throwError(() => new Error('Network error')));
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    await expect(
      httpService.get<string>('http://url.com', { retries: 1, timeout: 0 }),
    ).rejects.toThrow('GET http://url.com failed after 2 attempts');
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      expect.stringMatching(/GET http:\/\/url.com - Failed:/),
    );

    expect(nestHttpService.get).toHaveBeenCalledTimes(2);
  });
});
