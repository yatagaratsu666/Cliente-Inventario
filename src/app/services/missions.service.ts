import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environment/environment';
import type { MissionListItem, MissionDetail, EnrollmentResponse, ProgressResponse, ResultResponse } from '../domain/mission.models';



@Injectable({ providedIn: 'root' })
export class MissionsService {

  
  private readonly baseUrl = (
    localStorage.getItem('MISSIONS_API') ||
    (window as any).__env?.MISSIONS_API ||
    environment.missionsApiBaseUrl
  ).replace(/\/+$/, '');

  constructor(private http: HttpClient) {}

  listMissions(params: { level?: number; difficulty?: string; type?: string; heroId?: string } = {}) {
    const query = new URLSearchParams();
    if (params.level) query.set('level', String(params.level));
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.type) query.set('type', params.type);
    if (params.heroId) query.set('heroId', params.heroId);
    return this.http.get<MissionListItem[]>(`${this.baseUrl}/missions?${query}`).pipe(
      map(list => list.slice(0, 2))
    );
  }

  getMission(id: string) {
    return this.http.get<MissionDetail>(`${this.baseUrl}/missions/${id}`);
  }

  enroll(missionId: string, heroId: string, rotations: string[], durationSeconds?: number) {
    const duration = Number.isFinite(durationSeconds as number) && (durationSeconds as number) > 0
      ? Math.floor(durationSeconds as number)
      : 22; // fallback fijo

    const body = { heroId, rotations, durationSeconds: duration };
    const url = `${this.baseUrl}/missions/${missionId}/enroll`;
    return this.http.post<EnrollmentResponse>(url, body);
  }

  progress(execId: string) {
    return this.http.get<ProgressResponse>(`${this.baseUrl}/missions/progress/${execId}`);
  }

  result(execId: string) {
    return this.http.get<ResultResponse>(`${this.baseUrl}/missions/result/${execId}`);
  }

  sse(execId: string): EventSource {
    return new EventSource(`${this.baseUrl}/events/stream/${execId}`);
  }
  updateCredits(nombreUsuario: string, creditos: number) {
  return this.http.patch(`${this.baseUrl}/usuarios/${nombreUsuario}/creditos`, { 
    creditos: creditos 
  });
}



}
