import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private http = inject(HttpClient);

  getAllProjects(page: number = 1, limit: number = 5): Observable<any> {
    const params = `?page=${page}&limit=${limit}`;
    return this.http.get(`${environment.apiUrl}/projects${params}`);
  }

  getProjects(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/projects`);
  }

  // getProjectById(id: string): Observable<any> {
  //   const key = `projects_id_${id}`;
  //   return this.getCached(key, () => this.http.get(environment.apiUrl + `/projects/${id}`));
  // }

  // private clearCache(): void {
  //   this.cache.clear();
  // }

  // addProject(data: any): Observable<any> {
  //   this.cache.clear();
  //   return this.http.post(environment.apiUrl + '/projects', data);
  // }

  // updateProject(id: string, data: any): Observable<any> {
  //   this.cache.clear();
  //   return this.http.put(environment.apiUrl + `/projects/${id}`, data);
  // }

  // deleteProject(id: string): Observable<any> {
  //   this.cache.clear();
  //   return this.http.delete(environment.apiUrl + `/projects/${id}`)
  // }

}
