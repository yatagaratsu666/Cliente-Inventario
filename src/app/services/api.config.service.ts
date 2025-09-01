import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {

  private readonly apiUrl: string = environment.apiUrl;
  private readonly battleUrl: string = environment.battleUrl;
  private readonly battleSocket: string = environment.battleSocket;
  private readonly chatUrl: string = environment.chatUrlSocket;

  getApiUrl(): string {
    return this.apiUrl;
  }

  getBattleUrl(): string {
    return this.battleUrl;
  }

  getBattleSocket(): string {
    return this.battleSocket;
  }

  getChatUrl(): string {
    return this.chatUrl;
  }
}

