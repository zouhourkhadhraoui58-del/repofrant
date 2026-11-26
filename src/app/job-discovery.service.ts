import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Job, SortOption } from './marketplace.model';
import { tap, catchError, of } from 'rxjs';

const SAMPLE_JOBS: Job[] = [
  {
    id: '1',
    title: 'Need a logo for student club',
    description: 'Looking for a clean modern logo and brand colors for our robotics club.',
    budget: 80,
    skills: ['Design', 'Illustrator', 'Logo'],
    isUrgent: true,
    createdAt: '2026-11-18T10:00:00Z',
    bids: [
      { id: 'b1', jobId: '1', freelancerName: 'Amira', amount: 65, createdAt: '2026-11-18T11:00:00Z' },
      { id: 'b2', jobId: '1', freelancerName: 'Youssef', amount: 50, createdAt: '2026-11-18T12:00:00Z' },
    ],
  },
  {
    id: '2',
    title: 'Calculus Tutor for midterms',
    description: 'Need help with integrals, series, and exam preparation for calculus 2.',
    budget: 120,
    skills: ['Calculus', 'Math', 'Tutoring'],
    isUrgent: false,
    createdAt: '2026-11-17T14:00:00Z',
    bids: [
      { id: 'b3', jobId: '2', freelancerName: 'Nour', amount: 100, createdAt: '2026-11-17T15:00:00Z' },
    ],
  },
  {
    id: '3',
    title: 'Fix Angular search component bug',
    description: 'Small TypeScript and Angular template fix needed before tomorrow morning.',
    budget: 150,
    skills: ['Angular', 'TypeScript', 'Frontend'],
    isUrgent: true,
    createdAt: '2026-11-19T08:00:00Z',
    bids: [],
  },
];

@Injectable({ providedIn: 'root' })
export class JobDiscoveryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  private readonly allJobs = signal<Job[]>(SAMPLE_JOBS);
  readonly searchQuery = signal<string>('');
  readonly selectedSkills = signal<string[]>([]);
  readonly sortBy = signal<SortOption>('highest-paying');

  // Liste mta3 kol el skill tags elli mawjoudin
  readonly availableSkills = computed(() => {
    const set = new Set<string>();
    for (const job of this.allJobs()) {
      for (const s of job.skills ?? []) {
        set.add(s);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  // Jobs mfiltrin w mratbin hasb recherche + skill tags + tri
  readonly filteredJobs = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const skills = this.selectedSkills().map((s) => s.toLowerCase());
    const sort = this.sortBy();

    const list = this.allJobs().filter((job) => {
      const matchesText =
        !q ||
        job.description.toLowerCase().includes(q) ||
        job.title.toLowerCase().includes(q);

      const matchesSkills =
        skills.length === 0 ||
        skills.every((reqSkill) =>
          (job.skills ?? []).some((js) => js.toLowerCase() === reqSkill)
        );

      return matchesText && matchesSkills;
    });

    if (sort === 'urgent') {
      return [...list].sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent) || b.budget - a.budget);
    }

    // 'highest-paying'
    return [...list].sort((a, b) => b.budget - a.budget);
  });

  fetchJobs() {
    let params = new HttpParams().set('sort', this.sortBy());
    if (this.searchQuery().trim()) {
      params = params.set('q', this.searchQuery().trim());
    }
    if (this.selectedSkills().length > 0) {
      params = params.set('skills', this.selectedSkills().join(','));
    }

    return this.http.get<Job[] | { jobs: Job[] }>(`${this.apiUrl}/jobs`, { params }).pipe(
      tap((res) => {
        const data = Array.isArray(res) ? res : (res?.jobs ?? []);
        if (data.length > 0) {
          this.allJobs.set(data);
        }
      }),
      catchError(() => {
        // Ken el backend mouch chaghal, yab9a yekhdem bel SAMPLE_JOBS
        return of(this.allJobs());
      })
    );
  }

  setSearch(q: string) {
    this.searchQuery.set(q);
  }

  toggleSkill(skill: string) {
    this.selectedSkills.update((current) =>
      current.includes(skill) ? current.filter((x) => x !== skill) : [...current, skill]
    );
  }

  setSort(sort: SortOption) {
    this.sortBy.set(sort);
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedSkills.set([]);
    this.sortBy.set('highest-paying');
  }
}