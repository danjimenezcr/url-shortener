import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UrlService } from '../../core/services/url.service';
import { Url } from '../../models/url.model';
import { UrlStatistics, Visit } from '../../models/visit.model';
import { DomainPipe } from '../../shared/pipes/domain.pipe';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule, DomainPipe],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  urlId: string = '';
  url: Url | null = null;
  statistics: UrlStatistics | null = null;
  loading: boolean = true;
  error: string | null = null;
  dailyData: { date: string; count: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private urlService: UrlService
  ) { }

  ngOnInit(): void {
    this.urlId = this.route.snapshot.paramMap.get('id') || '';
    if (this.urlId) {
      this.loadData();
    } else {
      this.error = 'Invalid URL ID';
      this.loading = false;
    }
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Load URL details and statistics in parallel
    Promise.all([
      this.urlService.getUrlById(this.urlId).toPromise(),
      this.urlService.getUrlStatistics(this.urlId).toPromise()
    ]).then(([url, stats]) => {
      this.url = url || null;
      this.statistics = stats || null;
      this.processDailyData();
      this.loading = false;
    }).catch((err) => {
      this.error = err.error?.error || 'Failed to load statistics. Please try again.';
      this.loading = false;
    });
  }

  processDailyData(): void {
    if (!this.statistics?.visits) {
      this.dailyData = [];
      return;
    }

    // Group visits by date
    const dailyMap = new Map<string, number>();
    
    this.statistics.visits.forEach(visit => {
      const date = new Date(visit.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    // Convert to array and sort by count (descending)
    this.dailyData = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count);
  }

  getShortUrl(shortCode: string): string {
    return this.urlService.getShortUrl(shortCode);
  }

  formatTimestamp(timestamp: Date): string {
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
