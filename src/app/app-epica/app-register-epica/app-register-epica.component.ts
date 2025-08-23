import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EpicsService } from '../../services/epics.service';
import { Epic } from '../../domain/epic.model';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/item.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-app-register-epica',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-epica.component.html',
  styleUrl: './app-register-epica.component.css',
})
export class AppRegisterEpicaComponent {
  effectTypes = Object.values(EffectType);
  heroTypes = Object.values(HeroType);
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
    masterChance: 0,
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
    if (!this.selectedFile) {
      console.error('Debes seleccionar una imagen');
      return false;
    }
    const {
      name,
      description,
      heroType,
      stock,
      effects,
      masterChance,
      cooldown,
    } = this.epic;

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

  private showAlert(
    icon: any,
    title: string,
    text: string,
    buttonColor: string = '#3085d6'
  ) {
    Swal.fire({ icon, title, text, confirmButtonColor: buttonColor });
  }

  onSubmit(): void {
    if (!this.validate()) {     
      this.showAlert('warning', 'Campos incompletos', 'Todos los campos son obligatorios');
    } else {
      const epicConId = { ...this.epic, id: 0 };

      this.epicService.createEpic(epicConId, this.selectedFile).subscribe({
        next: () => {
          this.showAlert('success', '¡Éxito!', 'Item creado con éxito');
          this.router.navigate(['/epics/control']);
        },
        error: (err) => {
          this.showAlert('error', 'Error', 'Hubo un problema al crear el item', '#d33');
          console.error('Error al crear epica:', err);
        },
      });
    }
  }
}
