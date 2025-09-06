import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/item.model';

/**
 * AppModifyWeaponComponent
 *
 * Componente Angular para modificar la información de un ítem tipo arma existente.
 * Se encarga de:
 * - Cargar los datos de un arma a partir de su ID
 * - Mostrar un formulario editable con los datos actuales
 * - Permitir cambiar imagen, nombre, descripción, efectos, héroe compatible, etc.
 * - Validar los datos antes de enviarlos al backend
 * - Actualizar el arma usando el `WeaponsService`
 * - Redirigir al listado de armas al terminar la edición
 *
 * Características:
 * - Uso de `ActivatedRoute` para obtener el ID del arma a editar
 * - Lógica para leer imagen en Base64 y mostrarla inmediatamente
 * - Validación simple de campos requeridos
 *
 * @property {EffectType[]} effectTypes Lista de tipos de efectos disponibles
 * @property {HeroType[]} heroTypes Lista de tipos de héroe disponibles
 * @property {number} weaponId ID del arma a editar
 * @property {Weapon} weapon Modelo de arma que se edita, inicializado con valores por defecto
 */
@Component({
  selector: 'app-app-modify-weapon',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-modify-weapon.component.html',
  styleUrl: './app-modify-weapon.component.css'
})
export class AppModifyWeaponComponent {
  effectTypes = Object.values(EffectType);
  heroTypes = Object.values(HeroType);
  weaponId: number = 0;
  weapon: Weapon = {
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
    private weaponService: WeaponsService
  ) {}

  /**
   * Inicializa el componente cargando el ID del arma desde la ruta
   * y solicitando los datos correspondientes si el ID es válido.
   * @returns {void}
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.weaponId = id ? +id : 0;

    if (this.weaponId) {
      this.loadWeapon(this.weaponId);
    }
  }

  /**
   * Lee la imagen seleccionada por el usuario y la asigna al objeto arma en Base64.
   * @param {Event} event Evento del input file
   * @returns {void}
   */
  readImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.weapon.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  /**
   * Obtiene los datos de un arma específica desde el backend.
   * @param {number} id ID del arma a cargar
   * @returns {void}
   */
  loadWeapon(id: number): void {
    this.weaponService.getWeaponById(id).subscribe({
      next: (data) => {
        this.weapon = data;
      },
      error: (error) => {
        console.error('Error al cargar armas:', error);
        alert('No se pudo obtener los datos del armas.');
      },
    });
  }

  /**
   * Valida que los campos requeridos del formulario estén completos y tengan valores válidos.
   * @returns {boolean} true si los datos son válidos, false en caso contrario
   */
  validate(): boolean {
    const { name, description, dropRate, heroType, stock, effects } = this.weapon;

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
   * Método alternativo para setear la imagen desde un input file (equivalente a readImage).
   * @param {Event} event Evento del input file
   * @returns {void}
   */
  setImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.weapon.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  /**
   * Envía la actualización del arma al backend.
   * - Si la validación falla, muestra un mensaje de alerta.
   * - Si el proceso es exitoso, redirige al listado de armas.
   * @returns {void}
   */
  onSubmit(): void {
    if (!this.validate()) {
      alert('Todos los campos son requeridos y los números deben ser válidos.');
      return;
    } else {
      const { _id, ...itemToUpdate } = this.weapon as any;

      this.weaponService.updateWeapon(this.weaponId, itemToUpdate).subscribe({
        next: () => {
          console.log('Arma actualizada correctamente.');
          this.router.navigate(['/weapons/control']);
        },
        error: (error) => {
          console.error('Error al actualizar arma:', error);
          alert('Error al actualizar item. Inténtalo de nuevo.');
        },
      });
    }
  }
}
