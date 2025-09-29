import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionDTO } from '../../domain/auction.model';

@Component({
  selector: 'app-auction-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-card.component.html',
  styleUrls: ['./auction-card.component.css']
})
export class AuctionCardComponent {
  @Input() auction!: AuctionDTO;

  get imageSrc() {
  const img = this.auction?.item?.imagen;
  if (!img) return 'https://via.placeholder.com/150';
  
  // Si es Base64, mantenemos el prefijo
  if (img.startsWith('data:image')) return img;
  
  // Si es URL normal, la devolvemos tal cual
  return img;
}

}
