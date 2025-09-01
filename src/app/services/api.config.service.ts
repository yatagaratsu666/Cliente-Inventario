import { Injectable } from '@angular/core';
import { environment } from '../enviroment/enviroment.test';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {

  private readonly apiUrl: string = environment.apiUrl;
  private readonly battleUrl: string = environment.battleUrl;
  private readonly chatUrl: string = environment.chatUrl;

  getApiUrl(): string {
    return this.apiUrl;
  }

  getBattleUrl(): string {
    return this.battleUrl;
  }

  getChatUrl(): string {
    return this.chatUrl;
  }
}

