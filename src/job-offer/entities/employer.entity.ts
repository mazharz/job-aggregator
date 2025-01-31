import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Employer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  companyName: string;

  @Column()
  website: string;

  @Column()
  industry: string;
}
