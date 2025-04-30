import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pod, CreatePodDto, UpdatePodDto } from '@my-monorepo/api-interfaces';

@Injectable({
  providedIn: 'root'
})
export class PodsService {
  private apiUrl = 'http://localhost:3000/api/pods';

  constructor(private http: HttpClient) {}

  getPods(): Observable<Pod[]> {
    return this.http.get<Pod[]>(this.apiUrl);
  }

  getPodsByNamespace(namespace: string): Observable<Pod[]> {
    return this.http.get<Pod[]>(`${this.apiUrl}?namespace=${namespace}`);
  }

  getPodsByCluster(clusterName: string): Observable<Pod[]> {
    return this.http.get<Pod[]>(`${this.apiUrl}?cluster=${clusterName}`);
  }

  getPodsByNode(nodeName: string): Observable<Pod[]> {
    return this.http.get<Pod[]>(`${this.apiUrl}?node=${nodeName}`);
  }

  getPodsByStatus(status: string): Observable<Pod[]> {
    return this.http.get<Pod[]>(`${this.apiUrl}?status=${status}`);
  }

  getPod(id: string): Observable<Pod> {
    return this.http.get<Pod>(`${this.apiUrl}/${id}`);
  }

  createPod(pod: CreatePodDto): Observable<Pod> {
    return this.http.post<Pod>(this.apiUrl, pod);
  }

  updatePod(id: string, pod: UpdatePodDto): Observable<Pod> {
    return this.http.patch<Pod>(`${this.apiUrl}/${id}`, pod);
  }

  deletePod(id: string): Observable<Pod> {
    return this.http.delete<Pod>(`${this.apiUrl}/${id}`);
  }
}
