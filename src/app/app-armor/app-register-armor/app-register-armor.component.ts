import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Armor, ArmorType } from '../../domain/armor.model';
import { ArmorsService } from '../../services/armors.service';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/item.model';
import Swal from 'sweetalert2';

/**
 * Componente encargado del registro de nuevas armaduras en el sistema.
 * Permite completar un formulario para crear armaduras, incluyendo
 * información como tipo, efectos, imagen y tasa de aparición.
 *
 * Características principales:
 * - Soporta carga de imágenes para la armadura.
 * - Valida los campos obligatorios antes de registrar la armadura.
 * - Muestra alertas de éxito o error mediante `SweetAlert2`.
 * - Utiliza `ArmorsService` para enviar los datos al backend.
 */

@Component({
  selector: 'app-app-register-armor',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-armor.component.html',
  styleUrl: './app-register-armor.component.css'
})
export class AppRegisterArmorComponent {
  //Tipos de heores, efectos y armaduras disponibles
  effectTypes = Object.values(EffectType);
  heroTypes = Object.values(HeroType);
  armorTypes = Object.values(ArmorType);
  armor: Armor = {
    id: 0,
    image: '',
    description: '',
    name: '',
    armorType: ArmorType.HELMET,
    heroType: HeroType.TANK,
    status: true,
    stock: 0,
    effects: [
      { effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 },
    ],
    dropRate: 0,
  };

  selectedFile?: File;

  constructor(private armorService: ArmorsService, private router: Router) {}

    /**
   * Captura el archivo seleccionado desde un input tipo file.
   * @param event Evento de selección de archivo.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

    /**
   * Valida que los campos obligatorios estén completos y correctos.
   * @returns `true` si los datos son válidos, `false` en caso contrario.
   */
  validate(): boolean {
    if (!this.selectedFile) {
      console.error('Debes seleccionar una imagen');
      return false;
    }
    const { name, description, stock, dropRate, effects } = this.armor;

    return !!(
      name &&
      description &&
      dropRate &&
      stock >= -1 &&
      effects?.length &&
      effects[0].durationTurns &&
      effects[0].effectType &&
      effects[0].value
    );
  }

  /**
   * Muestra una alerta modal con SweetAlert2.
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
   * Envía el formulario al backend para registrar una nueva armadura.
   * Si la validación falla, muestra una alerta de advertencia.
   * Si el registro es exitoso, redirige al panel de control de armaduras.
   */
  onSubmit(): void {
    if (!this.validate()) {
      this.showAlert('warning', 'Campos incompletos', 'Todos los campos son obligatorios');
    } else {
      const armorConId = { ...this.armor, id: 0 };

      this.armorService.createArmor(armorConId, this.selectedFile).subscribe({
        next: () => {
          this.showAlert('success', '¡Éxito!', 'Item creado con éxito');
          this.router.navigate(['/armors/control']);
        },
        error: (err) => {
          this.showAlert('error', 'Error', 'Hubo un problema al crear el item', '#d33');
          console.error('Error al crear armadura:', err);
        },
      });
    }
  }
}
