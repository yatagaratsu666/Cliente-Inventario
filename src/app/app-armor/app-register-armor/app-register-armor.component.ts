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
 * AppRegisterArmorComponent
 *
 * Componente Angular encargado de registrar nuevas armaduras.
 * Permite completar un formulario con todos los datos de la armadura,
 * incluyendo tipo, efectos, imagen y tasa de aparición.
 *
 * @property {Armor[]} armor - Modelo de armadura a crear con valores iniciales.
 * @property {EffectType[]} effectTypes - Tipos de efectos disponibles.
 * @property {HeroType[]} heroTypes - Tipos de héroes disponibles.
 * @property {ArmorType[]} armorTypes - Tipos de armaduras disponibles.
 * @property {File} [selectedFile] - Archivo de imagen seleccionado por el usuario.
 */
@Component({
  selector: 'app-app-register-armor',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-armor.component.html',
  styleUrl: './app-register-armor.component.css'
})
export class AppRegisterArmorComponent {
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
   *
   * @param {Event} event - Evento de selección de archivo.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  /**
   * Valida que los campos obligatorios del formulario estén completos
   * y correctos antes de enviarlos al backend.
   *
   * @returns {boolean} `true` si todos los campos son válidos, `false` en caso contrario.
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
   * Muestra una alerta modal utilizando SweetAlert2.
   *
   * @param {any} icon - Tipo de icono (success, error, warning, info).
   * @param {string} title - Título de la alerta.
   * @param {string} text - Mensaje descriptivo de la alerta.
   * @param {string} [buttonColor='#3085d6'] - Color del botón de confirmación.
   */
  private showAlert(icon: any, title: string, text: string, buttonColor: string = '#3085d6') {
    Swal.fire({ icon, title, text, confirmButtonColor: buttonColor });
  }

  /**
   * Envía los datos del formulario al backend para registrar una nueva armadura.
   * Si la validación falla, muestra una alerta de advertencia.
   * Si la creación es exitosa, notifica al usuario y redirige al listado de armaduras.
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
