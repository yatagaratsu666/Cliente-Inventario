import { Injectable } from '@angular/core';
import { environment } from '../enviroment/enviroment.test';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {

  private readonly apiUrl: string = environment.apiUrl;

  getApiUrl(): string {
    return this.apiUrl;
  }
}

