import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line no-restricted-imports
import { HttpService as NestHttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosError } from 'axios';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';

interface Config extends AxiosRequestConfig {
  /**
   * Number of times to retry the request if it happens to fail
   */
  retries?: number;
  /**
   * This will be increased exponentially with the number of retries
   */
  timeout?: number;
}

@Injectable()
export class HttpService {
  readonly logger = new Logger(HttpService.name);

  constructor(private readonly nestHttpService: NestHttpService) {}

  async get<D>(url: string, config?: Config): Promise<D> {
    const { retries = 2, timeout = 1000, ...axiosConfig } = config ?? {};

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        this.logger.log(`GET ${url} - Attempt ${attempt}`);

        const response = this.nestHttpService.get<D>(url, axiosConfig).pipe(
          map((res) => {
            this.logger.log(`GET ${url} - Success [${res.status}]`);
            return res.data;
          }),
          catchError((error: unknown) => {
            const formattedError = this.formatError(error);
            this.logger.error(`GET ${url} - Failed: ${formattedError.message}`);
            return throwError(() => new Error(formattedError.message));
          }),
        );

        return await firstValueFrom(response);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (attempt > retries) {
          throw new Error(`GET ${url} failed after ${retries + 1} attempts`);
        }
        const retryIn = timeout * ((attempt + 1) * (attempt + 1)); // exponential back-off
        this.logger.warn(
          `GET ${url} - Retrying in ${Math.floor(retryIn / 1000)}s...`,
        );
        await this.delay(retryIn);
      }
    }
    throw new Error(`GET ${url} - Unexpected failure`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatError(error: unknown): {
    message: string;
    status?: number;
    data?: unknown;
  } {
    if (error instanceof AxiosError) {
      return {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
    }
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: 'Unknown error occurred' };
  }
}
