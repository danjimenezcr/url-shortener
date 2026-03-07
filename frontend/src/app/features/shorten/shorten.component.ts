import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
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

  constructor(
    private urlService: UrlService,
    private cdr: ChangeDetectorRef
  ) { }

  get displayShortUrl(): string | null {
    console.log('[GETTER] displayShortUrl called');
    console.log('[GETTER] shortenedUrl:', this.shortenedUrl);
    console.log('[GETTER] shortCode:', this.shortCode);
    
    if (this.shortenedUrl && this.shortenedUrl.trim()) {
      console.log('[GETTER] Returning shortenedUrl:', this.shortenedUrl);
      return this.shortenedUrl;
    }

    if (this.shortCode && this.shortCode.trim()) {
      const constructed = this.urlService.getShortUrl(this.shortCode);
      console.log('[GETTER] Returning constructed URL:', constructed);
      return constructed;
    }

    console.log('[GETTER] Returning null');
    return null;
  }

  onSubmit(): void {
    if (this.loading) {
      return;
    }

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
      .pipe(
        // Ensure button state is restored on both success and failure.
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response: CreateUrlResponse) => {
          console.log('✅ [RESPONSE] Backend response received:', response);
          console.log('✅ [RESPONSE] response.shortUrl:', response?.shortUrl);
          console.log('✅ [RESPONSE] response.shortCode:', response?.shortCode);
          
          // Use shortUrl directly from backend response
          this.shortCode = response?.shortCode || null;
          this.shortenedUrl = response?.shortUrl || null;

          console.log('✅ [STATE] Set this.shortenedUrl to:', this.shortenedUrl);
          console.log('✅ [STATE] Set this.shortCode to:', this.shortCode);
          console.log('✅ [STATE] Calling getter now...');
          console.log('✅ [STATE] displayShortUrl getter returns:', this.displayShortUrl);

          // Force Angular change detection
          this.cdr.detectChanges();
          console.log('✅ [STATE] Change detection triggered');

          if (!this.shortenedUrl) {
            this.error = 'Short URL was created, but shortUrl field is missing in response.';
            console.log('❌ [ERROR] shortenedUrl is null or empty');
          } else {
            console.log('✅ [SUCCESS] Result should now be visible in UI');
          }
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to create short URL. Please try again.';
        }
      });
  }

  copyToClipboard(): void {
    const urlToCopy = this.displayShortUrl;
    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy).then(() => {
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
