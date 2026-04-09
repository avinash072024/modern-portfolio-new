import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface CreateFeedbackPayload {
  name: string;
  organization: string;
  designation: string;
  rating: number;
  message: string;
}

export interface CreateFeedbackResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private http = inject(HttpClient);

  private feedbackRequest$: Observable<{ success: boolean; count: number; feedback: CreateFeedbackPayload }> | null = null;

  createFeedback(payload: CreateFeedbackPayload): Observable<CreateFeedbackResponse> {
    return this.http.post<CreateFeedbackResponse>(`${environment.apiUrl}/feedback`, payload);
  }

  getAllFeedback(): Observable<{ success: boolean; count: number; feedback: CreateFeedbackPayload }> {
    if (!this.feedbackRequest$) {
      this.feedbackRequest$ = this.http
        .get<{ success: boolean; count: number; feedback: CreateFeedbackPayload }>(`${environment.apiUrl}/feedback`)
        .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    return this.feedbackRequest$;
  }
}
