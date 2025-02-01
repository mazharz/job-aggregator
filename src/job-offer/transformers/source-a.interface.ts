export interface SourceAResults {
  metadata: {
    requestId: string;
    timestamp: string;
  };
  jobs: SourceAJob[];
}

export interface SourceAJob {
  jobId: string;
  title: string;
  details?: {
    location?: string;
    type?: string;
    salaryRange?: string;
  };
  company: {
    name: string;
    industry?: string;
  };
  skills?: string[];
  postedDate?: string;
}
