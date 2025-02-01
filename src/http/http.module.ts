import { Global, Module } from '@nestjs/common';
// eslint-disable-next-line no-restricted-imports
import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { HttpService } from './http.service';

@Global()
@Module({
  imports: [NestHttpModule],
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
