import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionDTO } from '../../domain/auction.model';

/**
 * AuctionCardComponent
 *
 * Componente Angular encargado de mostrar la información de una subasta individual
 * dentro de una lista o galería de subastas.
 *
 * Funcionalidades principales:
 * - Renderiza los datos básicos de una subasta (imagen, nombre, precio, etc.).
 * - Muestra una imagen de respaldo si el ítem no tiene imagen asociada.
 * - Soporta imágenes tanto en formato URL como Base64.
 *
 * @property {AuctionDTO} auction - Objeto de datos de la subasta a visualizar.
 */
@Component({
  selector: 'app-auction-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-card.component.html',
  styleUrls: ['./auction-card.component.css']
})
export class AuctionCardComponent {
  /** Objeto de datos de la subasta a visualizar. */
  @Input() auction!: AuctionDTO;

  /**
   * Obtiene la fuente de imagen que se mostrará en la tarjeta.
   * - Si el ítem no tiene imagen, se muestra una imagen por defecto.
   * - Si la imagen está codificada en Base64, se mantiene su prefijo.
   * - Si la imagen es una URL, se devuelve tal cual.
   *
   * @returns {string} URL o cadena Base64 de la imagen a mostrar.
   */
  get imageSrc(): string {
    const img = this.auction?.item?.imagen;
    if (!img) return 'https://via.placeholder.com/150';
  
    if (img.startsWith('data:image')) return img;
  
    return img;
  }
}
