export interface SourceBResults {
  status: string;
  data: {
    jobsList: SourceBJobList;
  };
}

export interface SourceBJobList {
  [jobId: string]: SourceBJob;
}

export interface SourceBJob {
  position: string;
  location: {
    city: string;
    state: string;
    remote: boolean;
  };
  compensation: {
    min: number;
    max: number;
    currency: string;
  };
  employer: {
    companyName: string;
    website: string;
  };
  requirements: {
    experience: number;
    technologies: string[];
  };
  datePosted: string;
}
