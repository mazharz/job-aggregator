import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IEmployer } from '../job-offer.interface';

@Entity()
export class Employer implements IEmployer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  companyName: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  industry: string;
}
