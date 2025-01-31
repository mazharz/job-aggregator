import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('healthcheck')
  getHello() {
    return {
      date: new Date(),
    };
  }
}
