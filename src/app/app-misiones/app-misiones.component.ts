import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MissionsService } from '../services/missions.service';
import { MissionListItem} from '../domain/mission.models';


@Component({
  selector: 'app-misiones',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule,RouterLink],
  templateUrl: './app-misiones.component.html',
  styleUrls: ['./app-misiones.component.css']
})
export class AppMisionesComponent implements OnInit {
  missions: MissionListItem[] | null = null;
  error: string | null = null;

  difficulty = '';
  type = '';


  constructor(private api:MissionsService) { }


  ngOnInit() {
    // puedes pasar heroId o level; aquí fijo nivel 3 para el estado inicial
    this.api.listMissions({ level: 3 }).subscribe({
      next: list => this.missions = list,
      error: err => this.error = (err?.error?.error || err?.message || 'No se pudieron cargar las misiones')
    });
  }
}