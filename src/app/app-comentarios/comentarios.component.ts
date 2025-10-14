import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * ComentariosComponent
 *
 * Componente encargado de **integrar los comentarios del sistema** dentro
 * de la aplicación Angular mediante un **Web Component externo** (`comments-root`).
 *
 * Este componente actúa como un contenedor que:
 * - Carga dinámicamente los elementos personalizados del módulo de comentarios.
 * - Evita colisiones con el `<app-root>` de Angular utilizando un selector distinto.
 *
 * @property {void} ngOnInit - Método del ciclo de vida que importa dinámicamente el componente de comentarios.
 */
@Component({
  selector: 'app-comentarios',
  // Usamos template inline con el custom element renombrado para evitar colisión con el <app-root> de Angular
  template: '<comments-root></comments-root>',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComentariosComponent implements OnInit {

  /**
   * Inicializa el componente cargando dinámicamente los Web Components
   * necesarios para los comentarios.  
   *
   * @returns {void}
   */
  ngOnInit(): void {
    // Importar dinámicamente los web components cuando se necesiten
    import('./web-components/app-root/index').catch(err =>
      console.error('Error loading comments:', err)
    );
  }
}
