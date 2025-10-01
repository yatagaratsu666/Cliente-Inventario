import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-comentarios',
  // Usamos template inline con el custom element renombrado para evitar colisión con el <app-root> de Angular
  template: '<comments-root></comments-root>',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComentariosComponent implements OnInit {

  ngOnInit() {
    // Importar dinámicamente los web components cuando se necesiten
    import('./web-components/app-root/index').catch(err => console.error('Error loading comments:', err));
  }
}