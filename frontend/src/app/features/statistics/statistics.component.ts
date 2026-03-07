import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UrlService } from '../../core/services/url.service';
import { Url } from '../../models/url.model';
import { UrlStatistics } from '../../models/visit.model';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil, timeout } from 'rxjs/operators';

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
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.urlId = params.get('id') || '';

      if (this.urlId) {
        this.loadData();
      } else {
        this.error = 'Invalid URL ID';
        this.loading = false;
      }
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
      url: this.urlService.getUrlById(this.urlId).pipe(timeout(8000)),
      stats: this.urlService.getUrlStatistics(this.urlId).pipe(timeout(8000)),
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: ({ url, stats }) => {
        this.url = url;
        this.statistics = stats;
        this.processDailyData();
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to load statistics. Please try again.';
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

  getDisplayShortUrl(url: Url): string {
    return url.shortUrl || this.getShortUrl(url.shortCode);
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