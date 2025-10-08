import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-torneo-inscripcion',
  templateUrl: './app-torneo-inscripcion.component.html',
  styleUrls: ['./app-torneo-inscripcion.component.css']
})
export class AppTorneoInscripcionComponent {
  titulo = 'Inscripción';
  descripcion = 'Aquí puedes inscribirte en los torneos disponibles.';
}