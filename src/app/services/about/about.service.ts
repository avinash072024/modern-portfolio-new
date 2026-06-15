import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AboutService {

  constructor(private http: HttpClient) { }

  getEducation(): Observable<any> {
    return this.http.get(environment.apiUrl + `/education`);
  }

  getExperience(): Observable<any> {
    return this.http.get(environment.apiUrl + `/experience`);
  }
}
