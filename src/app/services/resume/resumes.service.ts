import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResumesService {
  constructor(private http: HttpClient) { }

  getATSResume(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/resumes/generate-ats`, {
      responseType: 'blob',
    });
  }
}
