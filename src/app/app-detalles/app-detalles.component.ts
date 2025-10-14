import { Component, EventEmitter, Input, Output, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';
import { Item } from '../domain/item.model';
import { Armor } from '../domain/armor.model';
import { Weapon } from '../domain/weapon.model';
import { Epic } from '../domain/epic.model';
import Hero from '../domain/heroe.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-detalles.component.html',
  styleUrls: ['./app-detalles.component.css']
})
export class AppDetallesComponent {
  @Input() item: Item | Armor | Weapon | Epic | Hero | null = null;
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  cerrar(): void {
    this.closeModal.emit();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['item'] && this.item) {
      await this.cargarComentariosItem(this.item);
    }
  }

  getDetalles(): { key: string; value: any }[] {
    if (!this.item) return [];

    const excludedKeys = ['_id', 'image', 'id', 'status', 'stock'];

    return Object.entries(this.item)
      .filter(([key, val]) =>
        typeof val !== 'object' &&
        val !== null &&
        !excludedKeys.includes(key)
      )
      .map(([key, val]) => ({ key, value: val }));
  }

private async ensureCommentsRoot(): Promise<void> {
  // Buscar el contenedor del modal
  const container = document.querySelector('#comments-container .comments-wrapper');
  if (!container) return;

  // Evitar duplicar el componente
  if (container.querySelector('comments-root')) return;

  try {
    if ((window as any).customElements && !customElements.get('comments-root')) {
      await customElements.whenDefined('comments-root');
    }
  } catch {}

  // Crear el elemento comments-root dentro del contenedor existente
  const host = document.createElement('comments-root');
  host.setAttribute('minimal', '');
  container.appendChild(host);
}



async cargarComentariosItem(item: any): Promise<void> {
  if (!item) return;

  try {
    await import('../app-comentarios/web-components/app-root/index');
  } catch (err) {
    console.warn('[Detalles] No se pudo cargar el módulo de comentarios:', err);
  }

  let tipo: 'item' | 'armor' | 'weapon' = 'item';
  const knownArmorTypes = ['HELMET', 'CHEST', 'GLOVERS', 'BRACERS', 'PANTS', 'BOOTS'];

  if (item.weaponType) tipo = 'weapon';
  else if (item.armorType && knownArmorTypes.includes(item.armorType)) tipo = 'armor';

  const id =
    item.armorId ?? item.weaponId ?? item.itemId ?? item.id ?? item._id;

  if (!id) {
    console.warn('[Detalles] ID inválido para comentarios', item);
    return;
  }

  await this.ensureCommentsRoot();

  window.dispatchEvent(
    new CustomEvent('open-comments', {
      detail: { tipo, id, name: item.name },
    })
  );
}

}
