import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuctionService } from '../../services/auction.service';
import { SocketService } from '../../services/socket.service';
import { AuctionDTO } from '../../domain/auction.model';
import { AuctionCardComponent } from '../auction-card/auction-card.component';
import { AuctionDetailsComponent } from '../auction-details/auction-details.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auction-list',
  standalone: true,
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css'],
  imports: [FormsModule, AuctionCardComponent, AuctionDetailsComponent]
})
export class AuctionListComponent implements OnInit, OnDestroy {
  auctions: AuctionDTO[] = [];
  filtered: AuctionDTO[] = [];
  filter = '';
  selected: AuctionDTO | null = null;
  token?: string;

  constructor(
    private auctionService: AuctionService,
    private socketService: SocketService
  ) {}

  async ngOnInit() {
    await this.loadAuctions();

    const socket = this.socketService.connect(this.token);
    socket.on('auction-updated', (updated: AuctionDTO) => {
      this.auctions = this.auctions.map(a =>
        a.id === updated.id ? updated : a
      );
      this.applyFilter();
    });

    socket.on('auction-created', (created: AuctionDTO) => {
      this.auctions.push(created);
      this.applyFilter();
    });
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  async loadAuctions() {
    try {
      const data = await this.auctionService.listAuctions(this.token);
      this.auctions = data;
      this.applyFilter();
    } catch (err) {
      console.error('Error cargando subastas:', err);
    }
  }

  applyFilter() {
    const q = this.filter.trim().toLowerCase();
    this.filtered = !q
      ? this.auctions
      : this.auctions.filter(a =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
        );
  }

  openDetails(a: AuctionDTO) {
    this.selected = a;
  }

  closeDetails() {
    this.selected = null;
  }
}

