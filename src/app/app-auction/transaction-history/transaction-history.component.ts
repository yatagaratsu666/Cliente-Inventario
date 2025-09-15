import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionDTO } from '../../domain/auction.model';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-history.component.html'
})
export class TransactionHistoryComponent {
  @Input() purchased: AuctionDTO[] = [];
  @Input() sold: AuctionDTO[] = [];
}
