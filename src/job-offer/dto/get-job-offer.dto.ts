import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBooleanString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'The page of results to show',
    required: false,
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({
    description: 'Maximum number of results per page',
    maximum: 100,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Max(100)
  limit?: number;
}

export class GetJobOfferDto extends PaginationDto {
  @ApiProperty({
    description: 'Title of the job to filter by',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Remote status of jobs to filter by',
    required: false,
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  remote?: string;

  @ApiProperty({
    description: 'Minimum compensation',
    required: false,
    example: 80_000,
  })
  @IsOptional()
  @IsNumber()
  minCompensation?: number;

  @ApiProperty({
    description: 'Maximum compensation',
    required: false,
    example: 130_000,
  })
  @IsOptional()
  @IsNumber()
  maxCompensation?: number;

  @ApiProperty({
    description: 'Currency of the compensation',
    required: false,
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Number of years of experience',
    required: false,
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  experienceRequired?: number;

  @ApiProperty({
    description: 'Type of job',
    required: false,
    example: 'full-time',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Order of postedDate',
    required: false,
    enum: ['DESC', 'ASC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortByPostedDate?: 'ASC' | 'DESC';

  @ApiProperty({
    description: 'Employer name to filter by',
    required: false,
    example: 'techcorp',
  })
  @IsOptional()
  @IsString()
  employerName?: string;

  @ApiProperty({
    description: 'City of the job offer to filter by',
    required: false,
    example: 'san francisco',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Skills to filter by',
    required: false,
    example: 'html,css',
  })
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
