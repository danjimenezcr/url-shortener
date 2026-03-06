import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UrlService } from '../../core/services/url.service';
import { CreateUrlResponse } from '../../models/url.model';

@Component({
  selector: 'app-shorten',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shorten.component.html',
  styleUrls: ['./shorten.component.css']
})
export class ShortenComponent {
  originalUrl: string = '';
  shortenedUrl: string | null = null;
  shortCode: string | null = null;
  error: string | null = null;
  loading: boolean = false;
  copied: boolean = false;

  constructor(private urlService: UrlService) { }

  onSubmit(): void {
    // Reset state
    this.error = null;
    this.shortenedUrl = null;
    this.shortCode = null;
    this.copied = false;

    // Validate input
    if (!this.originalUrl.trim()) {
      this.error = 'Please enter a URL';
      return;
    }

    // Basic URL validation
    if (!this.isValidUrl(this.originalUrl)) {
      this.error = 'Please enter a valid URL (include http:// or https://)';
      return;
    }

    this.loading = true;

    this.urlService.createShortUrl({ originalUrl: this.originalUrl })
      .subscribe({
        next: (response: CreateUrlResponse) => {
          this.shortCode = response.shortCode;
          this.shortenedUrl = this.urlService.getShortUrl(response.shortCode);
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to create short URL. Please try again.';
          this.loading = false;
        }
      });
  }

  copyToClipboard(): void {
    if (this.shortenedUrl) {
      navigator.clipboard.writeText(this.shortenedUrl).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      }).catch((err) => {
        console.error('Failed to copy:', err);
      });
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  reset(): void {
    this.originalUrl = '';
    this.shortenedUrl = null;
    this.shortCode = null;
    this.error = null;
    this.copied = false;
  }
}
