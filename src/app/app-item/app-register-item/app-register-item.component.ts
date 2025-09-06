import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ItemsService } from '../../services/items.service';
import { Item, HeroType } from '../../domain/item.model';
import { Effect, EffectType } from '../../domain/effect.model';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

/**
 * AppRegisterItemComponent
 *
 * Componente Angular encargado de registrar nuevos ítems generales (no armas) para los héroes.
 * Se encarga de:
 * - Mostrar un formulario con todos los campos requeridos para crear el ítem
 * - Permitir la selección de una imagen asociada al ítem
 * - Validar datos antes de enviarlos al backend
 * - Crear el ítem a través del `ItemsService`
 * - Notificar al usuario con alertas personalizadas usando SweetAlert
 * - Redirigir al listado de ítems una vez creado el registro
 *
 * Características:
 * - Uso de `FormsModule` para el manejo del formulario
 * - Muestra dinámicamente los tipos de efecto y tipos de héroe a elegir
 * - Valida que todos los campos estén completos y que exista imagen antes de enviar
 */

@Component({
  selector: 'app-app-register-item',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-register-item.component.html',
  styleUrl: './app-register-item.component.css',
})
export class AppRegisterItemComponent {
  // Lista de tipos de héroes y efectos para los select del formulario
  heroTypes = Object.values(HeroType);
  effectTypes = Object.values(EffectType);
  // Modelo de ítem inicializado con valores por defecto
  item: Item = {
    id: 0,
    image: '',
    heroType: HeroType.TANK,
    description: '',
    name: '',
    status: true,
    stock: 0,
    effects: [
      { effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 },
    ],
    dropRate: 0,
  };

  selectedFile?: File;

  constructor(private itemsService: ItemsService, private router: Router) {}

    /**
   * Maneja el evento de selección de archivo para asociar una imagen al ítem.
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
      console.log(`Debes seleccionar una imagen`);
      return false;
    }
    const { name, description, stock, dropRate, heroType, effects } = this.item;

    return !!(
      name &&
      description &&
      dropRate &&
      heroType &&
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
private showAlert(icon: any, title: string, text: string, buttonColor: string = '#3085d6') {
  Swal.fire({ icon, title, text, confirmButtonColor: buttonColor });
}

  /**
   * Envía los datos del formulario al backend para crear el ítem.
   * Si la validación falla, muestra advertencia.
   * Si el proceso es exitoso, notifica al usuario y redirige al listado de ítems.
   */
onSubmit(): void {
  if (!this.validate()) {
    this.showAlert('warning', 'Campos incompletos', 'Todos los campos son obligatorios');
  } else {
    const itemConId = { ...this.item, id: 0 };

    this.itemsService.createItem(itemConId, this.selectedFile).subscribe({
      next: () => {
        this.showAlert('success', '¡Éxito!', 'Item creado con éxito');
        this.router.navigate(['/items/control']);
      },
      error: (err) => {
        this.showAlert('error', 'Error', 'Hubo un problema al crear el item', '#d33');
        console.error('Error al crear item:', err);
      },
    });
  }
}

}
