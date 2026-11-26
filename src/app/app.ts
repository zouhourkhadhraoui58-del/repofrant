import { Component, inject, OnInit } from '@angular/core';
import { JobDiscoveryService } from './job-discovery.service';
import { Job, SortOption } from './marketplace.model';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  readonly discovery = inject(JobDiscoveryService);

  ngOnInit() {
    this.discovery.fetchJobs().subscribe();
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.discovery.setSearch(value);
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.discovery.setSort(value);
  }

  isSkillSelected(skill: string): boolean {
    return this.discovery.selectedSkills().includes(skill);
  }

  sortedBids(job: Job) {
    return [...(job.bids ?? [])].sort((a, b) => a.amount - b.amount);
  }
}