import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EpicsService } from '../../services/epics.service';
import { Epic } from '../../domain/epic.model';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/item.model';
import Swal from 'sweetalert2';

/**
 * Componente encargado del registro de nuevas épicas en el sistema.
 * Permite ingresar los datos de la épica, asociar efectos y guardar la información
 * en el backend mediante el servicio `EpicsService`.
 *
 * Características principales:
 * - Formulario reactivo para crear una épica.
 * - Soporte para carga de imágenes desde archivo.
 * - Validación de campos requeridos antes del envío.
 * - Uso de SweetAlert2 para notificaciones visuales.
 *
 */

@Component({
  selector: 'app-app-register-epica',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-epica.component.html',
  styleUrl: './app-register-epica.component.css',
})
export class AppRegisterEpicaComponent {
  // Lista de tipos de efectos disponibles
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

    /**
   * Captura el archivo seleccionado desde el input tipo `file`.
   * @param event Evento generado al seleccionar un archivo.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

    /**
   * Valida que los campos obligatorios del formulario estén completos
   * y que el archivo de imagen haya sido cargado.
   * @returns `true` si todos los campos son válidos, de lo contrario `false`.
   */
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

  /** 
   * Muestra una alerta visual utilizando SweetAlert2.
   */
  private showAlert(
    icon: any,
    title: string,
    text: string,
    buttonColor: string = '#3085d6'
  ) {
    Swal.fire({ icon, title, text, confirmButtonColor: buttonColor });
  }

    /**
   * Envía la información de la épica al backend si la validación es exitosa.
   * En caso contrario, muestra una alerta de advertencia.
   */
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
