import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Employer } from './employer.entity';
import { Skill } from './skill.entity';
import { Location } from './location.entity';
import { IJobOffer } from '../job-offer.interface';

@Entity()
// externalIds should be theoretically unique from each source
@Unique(['externalId', 'provider'])
export class JobOffer implements IJobOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  externalId: string;

  /**
   * The provider from which this job was sourced from
   */
  @Column()
  provider: string;

  @Column()
  title: string;

  @Column()
  remote: boolean;

  @Column()
  minCompensation: number;

  @Column()
  maxCompensation: number;

  @Column({ length: 3 })
  currency: string;

  @Column()
  experienceRequired: number;

  @Column()
  type: string;

  @CreateDateColumn()
  datePosted: Date;

  @ManyToOne(() => Location, { onDelete: 'SET NULL' })
  location: Location;

  @ManyToOne(() => Employer, {
    nullable: false,
    onDelete: 'CASCADE', // job offer doesn't make sense if there is no employer
  })
  employer: Employer;

  @ManyToMany(() => Skill, { onDelete: 'SET NULL' })
  @JoinTable()
  skills: Skill[];
}
