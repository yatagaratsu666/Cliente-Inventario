import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EpicsService } from '../../services/epics.service';
import { Epic } from '../../domain/epic.model';
import { EffectType } from '../../domain/effect.model';

@Component({
  selector: 'app-app-register-epica',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-epica.component.html',
  styleUrl: './app-register-epica.component.css'
})
export class AppRegisterEpicaComponent {
    effectTypes = Object.values(EffectType);
    epic: Epic = {
    id: 0,
    image: '',
    description: '',
    name: '',
    heroType: '',
    status: true,
    effects: [
      { effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 },
    ],
    cooldown: 0,
    isAvailable: true,
    masterChance: 0
  };

  selectedFile?: File;

  constructor(private epicService: EpicsService, private router: Router) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
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

  onSubmit(): void {
    if (!this.validate()) {
      alert('Todos los campos deben ser obligatorios');
    } else {
      const epicConId = { ...this.epic, id: 0 };

      this.epicService.createEpic(epicConId, this.selectedFile).subscribe({
        next: (newEpic) => {
          console.log('Epica creada con éxito:', newEpic);
          this.router.navigate(['/epics/control']);
        },
        error: (err) => {
          console.error('Error al crear epica:', err);
        },
      });
    }
  }
}
