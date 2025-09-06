import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Armor, ArmorType } from '../../domain/armor.model';
import { ArmorsService } from '../../services/armors.service';
import { EffectType } from '../../domain/effect.model';
import { HeroType } from '../../domain/item.model';

/**
 * AppModifyArmorComponent
 *
 * Componente Angular encargado de la modificación de armaduras existentes.
 * Permite cargar los datos de una armadura, editar sus atributos y
 * enviar las actualizaciones al backend.
 *
 * @property {number} armorId - ID de la armadura que se va a modificar.
 * @property {EffectType[]} effectTypes - Tipos de efectos disponibles.
 * @property {HeroType[]} heroTypes - Tipos de héroes disponibles.
 * @property {ArmorType[]} armorTypes - Tipos de armaduras disponibles.
 * @property {Armor} armor - Modelo de armadura con valores iniciales.
 */
@Component({
  selector: 'app-app-modify-armor',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-modify-armor.component.html',
  styleUrl: './app-modify-armor.component.css'
})
export class AppModifyArmorComponent {
  armorId: number = 0;
  effectTypes = Object.values(EffectType);
  heroTypes = Object.values(HeroType);
  armorTypes = Object.values(ArmorType);
  armor: Armor = {
    id: 0,
    name: '',
    description: '',
    armorType: ArmorType.HELMET,
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
    private armorService: ArmorsService
  ) { }

  /**
   * Obtiene el ID desde la ruta y carga la armadura correspondiente desde el backend.
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.armorId = id ? +id : 0;

    if (this.armorId) {
      this.loadArmor(this.armorId);
    }
  }

  /**
   * Carga la información de una armadura desde el backend.
   * @param {number} id - ID de la armadura a cargar.
   */
  loadArmor(id: number): void {
    this.armorService.getArmorById(id).subscribe({
      next: (data) => {
        this.armor = data;
      },
      error: (error) => {
        console.error('Error al cargar armadura:', error);
        alert('No se pudo obtener los datos de la armadura.');
      },
    });
  }

  /**
   * Lee una imagen desde un input file y la asigna al modelo de la armadura.
   * @param {Event} event - Evento de selección de archivo.
   */
  readImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => (this.armor.image = reader.result as string);
      reader.readAsDataURL(target.files[0]);
    }
  }

  /**
   * Alias de readImage, permite actualizar la imagen desde el input file.
   * @param {Event} event - Evento de selección de archivo.
   */
  setImage(event: Event): void {
    this.readImage(event);
  }

  /**
   * Valida que los campos obligatorios de la armadura sean correctos.
   * @returns {boolean} `true` si todos los campos son válidos, `false` en caso contrario.
   */
  validate(): boolean {
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
   * Envía la actualización de la armadura al backend.
   * Muestra alertas de error si los datos no son válidos.
   */
  onSubmit(): void {
    if (!this.validate()) {
      alert('Todos los campos son requeridos.');
      return;
    }

    const { _id, ...armorToUpdate } = this.armor as any;

    this.armorService.updateArmor(this.armorId, armorToUpdate).subscribe({
      next: () => {
        console.log('Armadura actualizada correctamente.');
        this.router.navigate(['/armors/control']);
      },
      error: (error) => {
        console.error('Error al actualizar armadura:', error);
        alert('Error al actualizar armadura. Inténtalo de nuevo.');
      },
    });
  }
}
