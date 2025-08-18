import { bootstrapApplication } from '@angular/platform-browser'; // Importa la función para iniciar la aplicación
import { AppComponent } from './app/app.component'; // Componente raíz de la aplicación
import { provideRouter } from '@angular/router'; // Proveedor para configurar el enrutador
import routeConfig from './app/app.routes'; // Archivo de configuración de rutas
import { provideHttpClient } from '@angular/common/http'; // Proveedor para realizar peticiones HTTP

/**
 * Inicializa la aplicación con los proveedores necesarios.
 * @function bootstrapApplication
 * @param {typeof AppComponent} AppComponent - Componente principal de la aplicación.
 * @param {Object} config - Configuración de los proveedores de la aplicación.
 */
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routeConfig), // Configura las rutas de la aplicación
    provideHttpClient() // Configura el cliente HTTP (forma recomendada en Angular moderno)
  ]
});