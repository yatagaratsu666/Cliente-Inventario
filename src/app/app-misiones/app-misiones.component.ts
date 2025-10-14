import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MissionsService } from '../services/missions.service';
import { MissionListItem } from '../domain/mission.models';

/**
 * AppMisionesComponent
 *
 * Componente Angular encargado de mostrar la lista de misiones disponibles en el juego.
 *
 * Este componente se encarga de:
 * - Consultar las misiones disponibles desde el servicio `MissionsService`.
 * - Filtrar misiones por dificultad o tipo.
 * - Mostrar mensajes de error en caso de fallo en la carga de datos.
 *
 * @property {MissionListItem[] | null} missions - Lista de misiones obtenidas desde el backend.
 * @property {string | null} error - Mensaje de error si ocurre un problema al cargar las misiones.
 * @property {string} difficulty - Filtro actual de dificultad aplicado a la lista de misiones.
 * @property {string} type - Filtro actual de tipo aplicado a la lista de misiones.
 * @property {MissionsService} api - Servicio utilizado para obtener los datos de las misiones.
 */
@Component({
  selector: 'app-misiones',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './app-misiones.component.html',
  styleUrls: ['./app-misiones.component.css']
})
export class AppMisionesComponent implements OnInit {

  /** Lista de misiones obtenidas desde el backend */
  missions: MissionListItem[] | null = null;

  /** Mensaje de error si ocurre un problema al cargar las misiones */
  error: string | null = null;

  /** Filtro actual de dificultad aplicado a la lista de misiones */
  difficulty: string = '';

  /** Filtro actual de tipo aplicado a la lista de misiones */
  type: string = '';

  /**
   * Constructor del componente.
   *
   * Inyecta el servicio de misiones para realizar las peticiones al backend.
   *
   * @param {MissionsService} api - Servicio encargado de obtener la lista de misiones.
   */
  constructor(private api: MissionsService) { }

  /**
   * Inicializa el componente y carga la lista de misiones disponibles.
   *
   * Se ejecuta automáticamente al iniciar el componente. 
   * Realiza una llamada al servicio `MissionsService` pasando un nivel fijo (3) como ejemplo inicial.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    // Carga inicial de misiones con un nivel de ejemplo
    this.api.listMissions({ level: 3 }).subscribe({
      next: list => this.missions = list,
      error: err => this.error = (err?.error?.error || err?.message || 'No se pudieron cargar las misiones')
    });
  }
}
