import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'domain',
  standalone: true
})
export class DomainPipe implements PipeTransform {
  /**
   * Extract domain name from a full URL
   * Example: https://www.example.com/path -> example.com
   */
  transform(url: string): string {
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname;
      
      // Remove 'www.' prefix if present
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      
      return hostname;
    } catch (error) {
      // If URL is invalid, return the original string
      return url;
    }
  }
}
