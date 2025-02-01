import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ILocation } from '../job-offer.interface';

@Entity()
export class Location implements ILocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  state: string;

  @Column()
  city: string;
}
