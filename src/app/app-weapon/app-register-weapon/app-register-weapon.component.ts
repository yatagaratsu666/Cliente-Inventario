import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/item.model';
import Swal from 'sweetalert2';

/**
 * AppRegisterWeaponComponent
 *
 * Componente Angular encargado de registrar nuevos ítems tipo arma.
 * Se encarga de:
 * - Mostrar un formulario con todos los campos requeridos
 * - Permitir la selección de una imagen asociada al arma
 * - Validar datos antes de enviarlos al backend
 * - Crear el arma a través del `WeaponsService`
 * - Notificar al usuario con alertas personalizadas usando SweetAlert
 * - Redirigir al listado de armas una vez creado el ítem
 *
 * Características:
 * - Uso de `FormsModule` para el manejo del formulario
 * - Muestra dinámicamente los tipos de efecto y tipos de héroe a elegir
 * - Valida que todos los campos estén completos y que exista imagen antes de enviar
 */

@Component({
  selector: 'app-app-register-weapon',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-weapon.component.html',
  styleUrl: './app-register-weapon.component.css',
})


export class AppRegisterWeaponComponent {
  // Lista de tipos de efectos y héroes para los select del formulario
  effectTypes = Object.values(EffectType);
  heroTypes = Object.values(HeroType);
  // Modelo de arma inicializado con valores por defecto
  weapon: Weapon = {
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
    dropRate: 0,
  };

  selectedFile?: File;

  constructor(private weaponService: WeaponsService, private router: Router) {}

    /**
   * Maneja el evento de selección de archivo para asociar una imagen al arma.
   * @param event Evento emitido por el input file
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

    /**
   * Valida que todos los campos obligatorios del formulario estén completos
   * y que se haya seleccionado una imagen.
   * @returns true si los datos son válidos, false si falta algo
   */
  validate(): boolean {
    if (!this.selectedFile) {
      console.error('Debes seleccionar una imagen');
      return false;
    }
    const { name, description, dropRate, heroType, stock, effects } =
      this.weapon;

    return !!(
      name &&
      description &&
      dropRate &&
      heroType &&
      stock &&
      stock >= -1 &&
      effects?.length &&
      effects[0].durationTurns &&
      effects[0].effectType &&
      effects[0].value
    );
  }

    /**
   * Muestra una alerta usando SweetAlert con parámetros personalizables.
   * @param icon Tipo de icono (success, error, warning, info)
   * @param title Título de la alerta
   * @param text Mensaje descriptivo
   * @param buttonColor Color del botón de confirmación (por defecto azul)
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
   * Envía los datos del formulario al backend para crear el arma.
   * Si la validación falla, muestra advertencia.
   * Si el proceso es exitoso, notifica al usuario y redirige al listado de armas.
   */
  onSubmit(): void {
    if (!this.validate()) {
      this.showAlert('warning', 'Campos incompletos', 'Todos los campos son obligatorios');
    } else {
      const weaponConId = { ...this.weapon, id: 0 };

      this.weaponService
        .createWeapon(weaponConId, this.selectedFile)
        .subscribe({
          next: () => {
            this.showAlert('success', '¡Éxito!', 'Item creado con éxito');
            this.router.navigate(['/weapons/control']);
          },
          error: (err) => {
            this.showAlert('error', 'Error', 'Hubo un problema al crear el item', '#d33');
            console.error('Error al crear arma:', err);
          },
        });
    }
  }
}
