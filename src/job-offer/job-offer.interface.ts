export interface IJobOffer {
  id?: number;
  externalId: string;
  provider: string;
  title: string;
  remote?: boolean;
  minCompensation?: number;
  maxCompensation?: number;
  currency?: string;
  experienceRequired?: number;
  type?: string;
  datePosted?: Date;
  location?: ILocation;
  employer: IEmployer;
  skills?: ISkill[];
}

export interface IEmployer {
  id?: number;
  companyName: string;
  website?: string;
  industry?: string;
}

export interface ISkill {
  id?: number;
  name: string;
}

export interface ILocation {
  id?: number;
  state?: string;
  city: string;
}

export interface IInsertedJobOffer {
  raw: {
    id: number;
    externalId: string;
    provider: string;
  }[];
}
