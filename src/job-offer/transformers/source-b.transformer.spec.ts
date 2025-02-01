import { IJobOffer } from '../job-offer.interface';
import { SourceBResults } from './source-b.interface';
import { SourceBTransformer } from './source-b.transformer';

const incoming: SourceBResults = {
  status: 'success',
  data: {
    jobsList: {
      'job-742': {
        position: 'Backend Engineer',
        location: {
          city: 'Austin',
          state: 'NY',
          remote: true,
        },
        compensation: {
          min: 57000,
          max: 100000,
          currency: 'USD',
        },
        employer: {
          companyName: 'DataWorks',
          website: 'https://techcorp.com',
        },
        requirements: {
          experience: 1,
          technologies: ['JavaScript', 'Node.js', 'React'],
        },
        datePosted: '2025-01-29',
      },
      'job-977': {
        position: 'Software Engineer',
        location: {
          city: 'Austin',
          state: 'TX',
          remote: true,
        },
        compensation: {
          min: 64000,
          max: 86000,
          currency: 'USD',
        },
        employer: {
          companyName: 'DataWorks',
          website: 'https://techcorp.com',
        },
        requirements: {
          experience: 1,
          technologies: ['Python', 'Machine Learning', 'SQL'],
        },
        datePosted: '2025-01-24',
      },
    },
  },
};

const exptected: IJobOffer[] = [
  {
    externalId: 'job-742',
    provider: 'sourceB',
    title: 'Backend Engineer',
    remote: true,
    minCompensation: 57000,
    maxCompensation: 100000,
    currency: 'USD',
    experienceRequired: 1,
    datePosted: new Date('2025-01-29'),
    location: {
      city: 'Austin',
      state: 'NY',
    },
    employer: {
      companyName: 'DataWorks',
      website: 'https://techcorp.com',
    },
    skills: [{ name: 'JavaScript' }, { name: 'Node.js' }, { name: 'React' }],
  },
  {
    externalId: 'job-977',
    provider: 'sourceB',
    title: 'Software Engineer',
    remote: true,
    minCompensation: 64000,
    maxCompensation: 86000,
    currency: 'USD',
    experienceRequired: 1,
    location: {
      city: 'Austin',
      state: 'TX',
    },
    employer: {
      companyName: 'DataWorks',
      website: 'https://techcorp.com',
    },
    skills: [{ name: 'Python' }, { name: 'Machine Learning' }, { name: 'SQL' }],
    datePosted: new Date('2025-01-24'),
  },
];

describe('SourceBTransformer', () => {
  let sourceBTransformer: SourceBTransformer;

  beforeEach(() => {
    sourceBTransformer = new SourceBTransformer();
  });

  it('should should map incoming data to IJobOffer[]', () => {
    const transformed = sourceBTransformer.transform(incoming);
    expect(transformed).toStrictEqual(exptected);
  });
});
