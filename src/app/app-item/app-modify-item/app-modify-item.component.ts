import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ItemsService } from '../../services/items.service';
import { Item, HeroType } from '../../domain/item.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EffectType } from '../../domain/effect.model';

/**
 * AppModifyItemComponent
 *
 * Componente Angular encargado de modificar un ítem existente.
 * Se encarga de:
 * - Cargar la información de un ítem por su ID desde el backend
 * - Mostrar un formulario editable con todos los campos del ítem
 * - Permitir actualizar la imagen asociada al ítem
 * - Validar los datos antes de enviarlos
 * - Actualizar el ítem en el backend mediante `ItemsService`
 * - Redirigir al listado de ítems una vez realizada la actualización
 *
 * Características:
 * - Uso de `ActivatedRoute` para obtener el parámetro ID de la URL
 * - Manejo de formularios con `FormsModule`
 * - Selección dinámica de tipos de héroe y efectos
 * - Validación de campos requeridos y valores mínimos
 *
 * @property {HeroType[]} heroTypes Lista de tipos de héroe para el select
 * @property {EffectType[]} effectTypes Lista de tipos de efecto para el select
 * @property {number} itemId ID del ítem que se va a modificar
 * @property {Item} item Modelo del ítem con sus datos actuales
 */
@Component({
  selector: 'app-app-modify-item',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-modify-item.component.html',
  styleUrl: './app-modify-item.component.css',
})
export class AppModifyItemComponent {
  heroTypes = Object.values(HeroType);
  effectTypes = Object.values(EffectType);
  itemId: number = 0;
  item: Item = {
    id: 0,
    name: '',
    description: '',
    heroType: HeroType.TANK,
    dropRate: 0,
    image: '',
    status: false,
    stock: 0,
    effects: [{ effectType: EffectType.BOOST_DEFENSE, value: 0, durationTurns: 0 }],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemsService
  ) {}

  /**
   * Inicializa el componente obteniendo el ID desde los parámetros de la ruta
   * y cargando los datos del ítem correspondiente.
   * @returns {void}
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.itemId = id ? +id : 0;

    if (this.itemId) {
      this.loadItem(this.itemId);
    }
  }

  /**
   * Lee una imagen seleccionada desde un input file
   * y la asigna como `image` del ítem en formato Base64.
   * @param {Event} event Evento de selección de archivo
   */
  readImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.item.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  /**
   * Carga un ítem específico desde el backend por su ID.
   * @param {number} id ID del ítem a cargar
   */
  loadItem(id: number): void {
    this.itemService.getItemById(id).subscribe({
      next: (data) => {
        this.item = data;
      },
      error: (error) => {
        console.error('Error al cargar item:', error);
        alert('No se pudo obtener los datos del item.');
      },
    });
  }

  /**
   * Valida que los campos obligatorios del ítem estén completos
   * y que los valores ingresados sean coherentes.
   * @returns {boolean} true si la información es válida, false en caso contrario
   */
  validate(): boolean {
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
   * Establece la imagen del ítem a partir de un archivo cargado.
   * Similar a `readImage`.
   * @param {Event} event Evento de selección de archivo
   */
  setImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.item.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  /**
   * Envía los cambios del ítem al backend para su actualización.
   * Si la validación falla, muestra una alerta.
   * Si la actualización es exitosa, redirige al listado de ítems.
   * @returns {void}
   */
  onSubmit(): void {
    if (!this.validate()) {
      alert('Todos los campos son requeridos.');
      return;
    } else {
      const { _id, ...itemToUpdate } = this.item as any;

      this.itemService.updateItem(this.itemId, itemToUpdate).subscribe({
        next: () => {
          console.log('Item actualizado correctamente.');
          this.router.navigate(['/items/control']);
        },
        error: (error) => {
          console.error('Error al actualizar item:', error);
          alert('Error al actualizar item. Inténtalo de nuevo.');
        },
      });
    }
  }
}
