import { Injectable } from '@nestjs/common';
import { SourceAJob, SourceAResults } from './source-a.interface';
import { DataTransformer } from './transformer.interface';
import { IJobOffer, ILocation } from '../job-offer.interface';

@Injectable()
export class SourceATransformer implements DataTransformer<SourceAResults> {
  // extend as needed
  private readonly currency_map: Record<string, string> = {
    $: 'USD',
    '€': 'EUR',
  };
  private readonly salary_scale: Record<string, number> = {
    k: 1000,
    m: 1000000,
  };
  private readonly salary_format_regex =
    /^\$\d{1,3}(k|m)\s*-\s*\$\d{1,3}(k|m)$/;

  transform(data: SourceAResults): IJobOffer[] {
    const transformed: IJobOffer[] = data.jobs.map((job) => {
      const salary = this.getSalary(job);

      return {
        externalId: job.jobId,
        provider: 'sourceA',
        title: job.title,
        location: this.getLocation(job),
        type: job.details?.type,
        minCompensation: salary.min,
        maxCompensation: salary.max,
        currency: salary.currency,
        employer: {
          companyName: job.company?.name,
          industry: job.company?.industry,
        },
        skills: this.getSkills(job),
        datePosted: job.postedDate ? new Date(job.postedDate) : undefined,
      };
    });
    return transformed;
  }

  private getSkills(job: SourceAJob): { name: string }[] | undefined {
    if (!job.skills) return undefined;
    return job.skills.map((s) => ({ name: s }));
  }

  private getLocation(job: SourceAJob): ILocation {
    const splitted = job?.details?.location?.split(',');
    return {
      city: splitted?.[0]?.trim(),
      state: splitted?.[1]?.trim(),
    };
  }

  private getSalary(job: SourceAJob): {
    min?: number;
    max?: number;
    currency?: string;
  } {
    if (!job?.details?.salaryRange) return {};
    if (!this.salary_format_regex.test(job.details.salaryRange)) return {};

    const splitted = job?.details?.salaryRange?.split('-');
    const min = this.getSalaryAndCurrency(splitted?.[0]?.trim());
    const max = this.getSalaryAndCurrency(splitted?.[1]?.trim());
    return {
      min: min?.value,
      max: max?.value,
      currency: min?.currency || max?.currency,
    };
  }

  private getSalaryAndCurrency(salary: string | undefined): {
    value?: number;
    currency?: string;
  } {
    if (!salary) return {};
    const currency = salary.charAt(0);
    const scale = salary.charAt(salary.length - 1);
    const scaleNumber = this.salary_scale[scale] ?? 1000;
    const value = salary.slice(1, salary.length);
    const valueNumber = parseFloat(value);
    const finalValue = !Number.isNaN(valueNumber)
      ? valueNumber * scaleNumber
      : undefined;
    return {
      currency: this.currency_map[currency],
      value: finalValue,
    };
  }
}
