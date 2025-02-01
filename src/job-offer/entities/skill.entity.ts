import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ISkill } from '../job-offer.interface';

@Entity()
export class Skill implements ISkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
