import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Url, CreateUrlRequest, CreateUrlResponse } from '../../models/url.model';
import { UrlStatistics } from '../../models/visit.model';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  private apiUrl = 'http://127.0.0.1:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Create a shortened URL
   */
  createShortUrl(request: CreateUrlRequest): Observable<CreateUrlResponse> {
    return this.http.post<CreateUrlResponse>(`${this.apiUrl}/urls`, request);
  }

  /**
   * Get all URLs
   */
  getAllUrls(): Observable<Url[]> {
    return this.http.get<Url[]>(`${this.apiUrl}/urls`);
  }

  /**
   * Get URL details by ID
   */
  getUrlById(id: string): Observable<Url> {
    return this.http.get<Url>(`${this.apiUrl}/urls/${id}`);
  }

  /**
   * Get URL statistics by ID
   */
  getUrlStatistics(id: string): Observable<UrlStatistics> {
    return this.http.get<UrlStatistics>(`${this.apiUrl}/urls/${id}/stats`);
  }

  /**
   * Build the full shortened URL for display
   */
  getShortUrl(shortCode: string): string {
    return `http://127.0.0.1:3000/${shortCode}`;
  }
}
