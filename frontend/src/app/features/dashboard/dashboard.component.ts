import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UrlService } from '../../core/services/url.service';
import { Url } from '../../models/url.model';
import { DomainPipe } from '../../shared/pipes/domain.pipe';

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

  constructor(private urlService: UrlService) { }

  ngOnInit(): void {
    this.loadUrls();
  }

  loadUrls(): void {
    this.loading = true;
    this.error = null;

    this.urlService.getAllUrls().subscribe({
      next: (urls) => {
        this.urls = urls.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load URLs. Please try again.';
        this.loading = false;
      }
    });
  }

  getShortUrl(shortCode: string): string {
    return this.urlService.getShortUrl(shortCode);
  }

  copyToClipboard(shortCode: string): void {
    const url = this.getShortUrl(shortCode);
    navigator.clipboard.writeText(url).then(() => {
      this.copied = shortCode;
      setTimeout(() => {
        this.copied = null;
      }, 2000);
    }).catch((err) => {
      console.error('Failed to copy:', err);
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
