import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOfferModule } from './job-offer/job-offer.module';
import { JobOffer } from './job-offer/entities/job-offer.entity';
import { Employer } from './job-offer/entities/employer.entity';
import { Skill } from './job-offer/entities/skill.entity';
import { Location } from './job-offer/entities/location.entity';
import { HttpModule } from './http/http.module';

const ENTITIES = [JobOffer, Employer, Skill, Location];

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT) ?? 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: ENTITIES,
      synchronize: true,
    }),
    JobOfferModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
