import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ResumesService {
  private cachedResumes$?: Observable<any>;

  constructor(private http: HttpClient) { }

  getResumes(): Observable<any> {
    if (!this.cachedResumes$) {
      this.cachedResumes$ = this.http.get(environment.apiUrl + '/resumes').pipe(
        shareReplay({ bufferSize: 1, refCount: true, windowTime: 300000 }),
        catchError(err => {
          this.cachedResumes$ = undefined;
          return throwError(() => err);
        })
      );
    }
    return this.cachedResumes$;
  }

  downloadPdfFromBase64(base64Data: string, fileName: string): void {
    // 1. Clean the base64 string if it contains the data URI prefix
    const pureBase64 = base64Data.includes(',')
      ? base64Data.split(',')[1]
      : base64Data;

    // 2. Decode base64 string to raw binary data held in a string
    const byteCharacters = atob(pureBase64);

    // 3. Create an array of byte values
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    // 4. Convert byte values into a Uint8Array
    const byteArray = new Uint8Array(byteNumbers);

    // 5. Create a Blob with the PDF mime type
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // 6. Create an object URL pointing to the Blob
    const blobUrl = window.URL.createObjectURL(blob);

    // 7. Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'assets/resume/Avinash-Marbhal-Resume-Angular-Updated.pdf'); // Path to your file
    link.href = blobUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    // 8. Cleanup DOM and revoke URL to free up browser memory
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  }
}
