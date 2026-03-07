import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UrlService } from '../../core/services/url.service';
import { Url } from '../../models/url.model';
import { DomainPipe } from '../../shared/pipes/domain.pipe';
import { finalize, retry, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DomainPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  urls: Url[] = [];
  loading: boolean = true;
  error: string | null = null;
  copied: string | null = null;

  constructor(
    private urlService: UrlService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUrls();
  }

  loadUrls(): void {
    this.loading = true;
    this.error = null;

    this.urlService.getAllUrls().pipe(
      timeout(8000),
      retry(1),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (urls) => {
        this.urls = Array.isArray(urls)
          ? urls.sort((a, b) => {
              const dateA = new Date(b.createdAt).getTime();
              const dateB = new Date(a.createdAt).getTime();
              return dateA - dateB;
            })
          : [];

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.error || 'Failed to load URLs. Please try again.';
        this.urls = [];
        this.cdr.detectChanges();
      }
    });
  }

  getShortUrl(shortCode: string): string {
    return this.urlService.getShortUrl(shortCode);
  }

  getDisplayShortUrl(url: Url): string {
    return url.shortUrl || this.getShortUrl(url.shortCode);
  }

  copyToClipboard(shortCode: string): void {
    const urlData = this.urls.find(item => item.shortCode === shortCode);
    const url = urlData ? this.getDisplayShortUrl(urlData) : this.getShortUrl(shortCode);

    navigator.clipboard.writeText(url).then(() => {
      this.copied = shortCode;
      setTimeout(() => {
        this.copied = null;
        this.cdr.detectChanges();
      }, 2000);
    }).catch((err) => {
      console.error('Failed to copy:', err);
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}