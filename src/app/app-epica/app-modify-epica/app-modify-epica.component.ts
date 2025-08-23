import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Epic } from '../../domain/epic.model';
import { EpicsService } from '../../services/epics.service';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/item.model';

@Component({
  selector: 'app-app-modify-epica',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-modify-epica.component.html',
  styleUrl: './app-modify-epica.component.css'
})
export class AppModifyEpicaComponent {
  effectTypes = Object.values(EffectType);
  heroTypes = Object.values(HeroType);
  epicId: number = 0;
    epic: Epic = {
    id: 0,
    image: '',
    description: '',
    name: '',
    heroType: HeroType.TANK,
    status: true,
    stock: 0,
    effects: [
      { effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 },
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
        this.epic = data;
      },
      error: (error) => {
        console.error('Error al cargar epicas:', error);
        alert('No se pudo obtener los datos de la epica.');
      },
    });
  }

  validate(): boolean {
    const { name, description, heroType, stock, effects, masterChance, cooldown } = this.epic;

    return !!(
      name &&
      description &&
      heroType &&
      masterChance &&
      cooldown &&
      stock >= -1 &&
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
