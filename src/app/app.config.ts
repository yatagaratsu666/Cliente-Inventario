import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import  routes  from './app.routes';

/**
 * Configuración principal de la aplicación Angular.
 * 
 * - provideZoneChangeDetection:
 *   Ajusta el comportamiento de detección de cambios de Angular.
 *   El flag `eventCoalescing: true` hace que múltiples eventos
 *   se agrupen en uno solo, mejorando rendimiento.
 *
 * - provideRouter:
 *   Registra las rutas de la aplicación para el enrutamiento.
 *   Importa la configuración desde `./app.routes`.
 */

// Objeto de configuración de la aplicación que Angular usará al inicializar.
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};