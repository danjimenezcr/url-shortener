import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UrlService } from '../../core/services/url.service';
import { Url } from '../../models/url.model';
import { UrlStatistics } from '../../models/visit.model';
import { forkJoin, Subject, EMPTY } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  urlId: string = '';
  url: Url | null = null;
  statistics: UrlStatistics | null = null;

  loading: boolean = true;
  error: string | null = null;

  dailyData: { date: string; count: number }[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private urlService: UrlService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id') || ''),
      tap(id => {
        this.urlId = id;
        this.loading = true;
        this.error = null;
        this.url = null;
        this.statistics = null;
        this.dailyData = [];
      }),
      filter(id => {
        if (!id) {
          this.error = 'Invalid URL ID';
          this.loading = false;
          return false;
        }
        return true;
      }),
      switchMap(id =>
        forkJoin({
          url: this.urlService.getUrlById(id),
          stats: this.urlService.getUrlStatistics(id),
        }).pipe(
          catchError(err => {
            this.error = err?.error?.error || 'Failed to load statistics. Please try again.';
            return EMPTY; // evita que crashee y deja que finalize apague loading
          }),
          finalize(() => {
            this.loading = false; 
          })
        )
      ),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (!result) return; // EMPTY llega aquí como undefined
      this.url = result.url;
      this.statistics = result.stats;
      this.processDailyData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

loadData(): void {
  if (!this.urlId) {
    this.error = 'Invalid URL ID';
    this.loading = false;
    return;
  }

  this.loading = true;
  this.error = null;

  forkJoin({
    url: this.urlService.getUrlById(this.urlId),
    stats: this.urlService.getUrlStatistics(this.urlId),
  }).subscribe({
    next: ({ url, stats }) => {
      this.url = url;
      this.statistics = stats;
      this.processDailyData();
      this.loading = false;
    },
    error: (err) => {
      console.error('Statistics load error:', err);
      this.error = err?.error?.error || 'Failed to load statistics. Please try again.';
      this.loading = false;
    }
  });
}

  processDailyData(): void {
    if (!this.statistics?.visits?.length) {
      this.dailyData = [];
      return;
    }

    const dailyMap = new Map<string, number>();

    this.statistics.visits.forEach(visit => {
      const date = new Date(visit.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    this.dailyData = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count);
  }

  getShortUrl(shortCode: string): string {
    return this.urlService.getShortUrl(shortCode);
  }

  formatTimestamp(timestamp: string | Date): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getBarWidth(count: number): string {
    if (!this.dailyData.length) return '0%';
    const maxCount = Math.max(...this.dailyData.map(d => d.count));
    return `${(count / maxCount) * 100}%`;
  }
}