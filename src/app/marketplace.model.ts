export interface Bid {
  id: string;
  jobId: string;
  freelancerName: string;
  amount: number;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  skills: string[];
  isUrgent: boolean;
  createdAt: string;
  bids?: Bid[];
}

export type SortOption = 'highest-paying' | 'urgent' | 'newest';