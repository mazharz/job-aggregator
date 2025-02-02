import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBooleanString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetJobOfferDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBooleanString()
  remote?: string;

  @IsOptional()
  @IsNumber()
  minCompensation?: number;

  @IsOptional()
  @IsNumber()
  maxCompensation?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  experienceRequired?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortByPostedDate?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  employerName?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    // eslint-disable-next-line
    return Array.isArray(value) ? value : value.split(',');
  })
  skills?: string[];
}
