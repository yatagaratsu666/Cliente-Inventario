import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // 🔹 import ActivatedRoute

import { AuctionCardComponent } from '../auction-card/auction-card.component';
import { AuctionDetailsComponent } from '../auction-details/auction-details.component';

import { AuctionDTO } from '../../domain/auction.model';
import { AuctionService } from '../../services/auction.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-auction-list',
  standalone: true,
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css'],
  imports: [CommonModule, FormsModule, AuctionCardComponent, AuctionDetailsComponent]
})
export class AuctionListComponent implements OnInit, OnDestroy {
  auctions: AuctionDTO[] = [];
  filtered: AuctionDTO[] = [];
  filter: string = '';
  selected?: AuctionDTO;
  token?: string;
  userId?: string;

  // 🔹 filtros
  selectedType: string = '';
  selectedDuration: string = '';
  maxPrice?: number;

  // 🔹 lista de tipos únicos
  uniqueTypes: string[] = [];

  // 🔹 flag para ver solo mis pujas
  onlyMyBids: boolean = false;

  constructor(
    private auctionService: AuctionService,
    private socketService: SocketService,
    private router: Router,
    private route: ActivatedRoute // 🔹 para leer data de la ruta
  ) {}

  async ngOnInit() {
    this.token = localStorage.getItem('token') || undefined;
    this.userId = localStorage.getItem('userId') || undefined;

    // 🔹 leer flag de la ruta
    this.onlyMyBids = this.route.snapshot.data['onlyMyBids'] ?? false;

    await this.loadAuctions();

    const socket = this.socketService.connect(this.token);
    socket.on('auction-updated', (updated: AuctionDTO) => {
      this.auctions = this.auctions.map(a => a.id === updated.id ? updated : a);
      this.refreshTypes();
      this.applyFilter();
    });

    socket.on('auction-created', (created: AuctionDTO) => {
      this.auctions.push(created);
      this.refreshTypes();
      this.applyFilter();
    });
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  async loadAuctions() {
    try {
      let data: AuctionDTO[];

      if (this.onlyMyBids && this.userId) {
        // 🔹 solo subastas activas donde he pujado
        const all = await this.auctionService.listAuctions(this.token);
        data = all.filter(a => a.highestBidderId === this.userId && !a.isClosed);
      } else {
        data = await this.auctionService.listAuctions(this.token);
      }

      this.auctions = data;
      console.log("📦 Auctions recibidas:", this.auctions);

      // actualizar tipos únicos
      this.refreshTypes();

      this.applyFilter();
    } catch (err) {
      console.error('Error cargando subastas:', err);
    }
  }

  // 🔹 recalcular tipos únicos
  private refreshTypes() {
    const types = this.auctions
      .map(a => a.item?.type)
      .filter((t): t is string => !!t);

    this.uniqueTypes = Array.from(new Set(types));
  }

  applyFilter() {
    const q = this.filter.trim().toLowerCase();

    this.filtered = this.auctions.filter(a => {
      if (q && q.length >= 4) {
        const matchTitle = a.title?.toLowerCase().includes(q);
        const matchDesc = a.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      if (this.selectedType && a.item?.type !== this.selectedType) return false;

      if (this.selectedDuration) {
        const created = new Date(a.createdAt).getTime();
        const ends = new Date(a.endsAt).getTime();
        const durationHours = (ends - created) / (1000 * 60 * 60);

        if (this.selectedDuration === '24' && durationHours > 24) return false;
        if (this.selectedDuration === '48' && durationHours > 48) return false;
      }

      if (this.maxPrice && a.currentPrice > this.maxPrice) return false;

      return true;
    });
  }

  openDetails(a: AuctionDTO) {
    this.selected = a;
  }

  closeDetails() {
    this.selected = undefined;
  }

  // 🔹 Métodos para navegar desde los botones
  goToComprar() {
    this.router.navigate(['/auctions']);
  }

  goToVender() {
    this.router.navigate(['/auctions/vender']);
  }

  goToRecoger() {
    this.router.navigate(['/auctions/recoger']);
  }

  goToMisPujas() {
    this.router.navigate(['/auctions/mis-pujas']);
  }
}
