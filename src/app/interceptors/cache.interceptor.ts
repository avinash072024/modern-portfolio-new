import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';

interface CacheEntry {
  expiry: number;
  obs: Observable<HttpEvent<any>>;
}

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();
  private ttl = 1000 * 60 * 5; // 5 minutes

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // Allow callers to bypass cache with a header
    if (req.headers.has('x-refresh')) {
      const cleared = req.clone({ headers: req.headers.delete('x-refresh') });
      this.cache.delete(req.urlWithParams);
      return next.handle(cleared);
    }

    const key = req.urlWithParams;
    const now = Date.now();
    const cached = this.cache.get(key);

    if (cached && now < cached.expiry) {
      return cached.obs;
    }

    const shared = next.handle(req).pipe(
      // store only successful HttpResponse in cache (errors will not be cached)
      tap((event) => {
        if (event instanceof HttpResponse) {
          // noop here; we rely on shareReplay to replay the response
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(key, { expiry: now + this.ttl, obs: shared });

    return shared;
  }
}
