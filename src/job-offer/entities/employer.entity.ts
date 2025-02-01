import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IEmployer } from '../job-offer.interface';

@Entity()
export class Employer implements IEmployer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  companyName: string;

  @Column()
  website: string;

  @Column()
  industry: string;
}
