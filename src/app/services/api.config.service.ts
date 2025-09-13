/**
 * ApiConfigService
 *
 * Servicio Angular centralizado para obtener las URLs de configuración de la aplicación.
 * Se encarga de exponer, de forma limpia y desacoplada, las rutas base para:
 * - API principal (`apiUrl`)
 * - Servicio de batallas HTTP (`battleUrl`)
 * - Servicio de batallas en tiempo real vía WebSocket (`battleSocket`)
 * - Servicio de chat global vía WebSocket (`chatUrl`)
 *
 * Permite que el resto de servicios usen estas rutas sin depender directamente
 * de los archivos de `environment`, facilitando la mantenibilidad y los cambios
 * de entorno (dev, staging, prod) sin tener que modificar cada servicio.
 */

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
  private readonly inventarySocket: string = environment.inventarySocket

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

  getInventarySocket(): string {
    return this.inventarySocket;
  }
}

