import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Epic } from '../../domain/epic.model';
import { EpicsService } from '../../services/epics.service';

@Component({
  selector: 'app-app-modify-epica',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-modify-epica.component.html',
  styleUrl: './app-modify-epica.component.css'
})
export class AppModifyEpicaComponent {
  epicId: number = 0;
    epic: Epic = {
    id: 0,
    image: '',
    description: '',
    name: '',
    heroType: '',
    status: true,
    effects: [
      { effectType: '', value: 0, durationTurns: 0 },
    ],
    cooldown: 0,
    isAvailable: true,
    masterChance: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private epicService: EpicsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.epicId = id ? +id : 0;

    if (this.epicId) {
      this.loadEpic(this.epicId);
    }
  }

  readImage(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.epic.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  loadEpic(id: number): void {
    this.epicService.getEpicById(id).subscribe({
      next: (data) => {
        if (!data.effects || data.effects.length === 0) {
          data.effects = [{ effectType: '', value: 0, durationTurns: 0 }];
        }
        this.epic = data;
      },
      error: (error) => {
        console.error('Error al cargar epicas:', error);
        alert('No se pudo obtener los datos de la epica.');
      },
    });
  }

  validate(): boolean {
    const { name, description, heroType, effects, masterChance, cooldown } = this.epic;

    return !!(
      name &&
      description &&
      heroType &&
      masterChance &&
      cooldown &&
      effects?.length &&
      effects[0].durationTurns &&
      effects[0].effectType &&
      effects[0].value
    );
  }

  setImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.epic.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  onSubmit(): void {
    if (!this.validate()) {
      alert('Todos los campos son requeridos.');
      return;
    } else {
      const { _id, ...epicToUpdate } = this.epic as any;

      this.epicService.updateEpic(this.epicId, epicToUpdate).subscribe({
        next: () => {
          console.log('Epica actualizada correctamente.');
          this.router.navigate(['/epics/control']);
        },
        error: (error) => {
          console.error('Error al actualizar epica:', error);
          alert('Error al actualizar epica. Inténtalo de nuevo.');
        },
      });
    }
  }
}
