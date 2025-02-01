import { IJobOffer } from '../job-offer.interface';
import { SourceAResults } from './source-a.interface';
import { SourceATransformer } from './source-a.transformer';

const incoming: SourceAResults = {
  metadata: {
    requestId: 'req-q6qn1jb77',
    timestamp: '2025-02-01T07:10:22.966Z',
  },
  jobs: [
    {
      jobId: 'P1-552',
      title: 'Backend Engineer',
      details: {
        location: 'San Francisco, CA',
        type: 'Full-Time',
        salaryRange: '$71k - $133k',
      },
      company: {
        name: 'TechCorp',
        industry: 'Analytics',
      },
      skills: ['HTML', 'CSS', 'Vue.js'],
      postedDate: '2025-01-26T06:15:52.702Z',
    },
    {
      jobId: 'P1-292',
      title: 'Backend Engineer',
      details: {
        location: 'New York, NY',
        type: 'Full-Time',
        salaryRange: '$85k - $112k',
      },
      company: {
        name: 'TechCorp',
        industry: 'Design',
      },
      skills: ['HTML', 'CSS', 'Vue.js'],
      postedDate: '2025-01-23T15:19:35.984Z',
    },
  ],
};

const exptected: IJobOffer[] = [
  {
    externalId: 'P1-552',
    provider: 'sourceA',
    title: 'Backend Engineer',
    location: {
      state: 'CA',
      city: 'San Francisco',
    },
    type: 'Full-Time',
    minCompensation: 71000,
    maxCompensation: 133000,
    currency: 'USD',
    employer: {
      companyName: 'TechCorp',
      industry: 'Analytics',
    },
    skills: [{ name: 'HTML' }, { name: 'CSS' }, { name: 'Vue.js' }],
    datePosted: new Date('2025-01-26T06:15:52.702Z'),
  },
  {
    externalId: 'P1-292',
    provider: 'sourceA',
    title: 'Backend Engineer',
    location: {
      state: 'NY',
      city: 'New York',
    },
    type: 'Full-Time',
    minCompensation: 85000,
    maxCompensation: 112000,
    currency: 'USD',
    employer: {
      companyName: 'TechCorp',
      industry: 'Design',
    },
    skills: [{ name: 'HTML' }, { name: 'CSS' }, { name: 'Vue.js' }],
    datePosted: new Date('2025-01-23T15:19:35.984Z'),
  },
];

describe('SourceATransformer', () => {
  let sourceATransformer: SourceATransformer;

  beforeEach(() => {
    sourceATransformer = new SourceATransformer();
  });

  it('should map incoming data to IJobOffer[]', () => {
    const transformed = sourceATransformer.transform(incoming);
    expect(transformed).toStrictEqual(exptected);
  });
});
