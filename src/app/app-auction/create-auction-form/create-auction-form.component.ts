import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-auction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-auction-form.component.html'
})
export class CreateAuctionFormComponent {
  @Input() token?: string | null;
  @Input() availableItems: any[] = [];
  @Output() create = new EventEmitter<any>();

  form = {
    title: '',
    description: '',
    startingPrice: 0,
    buyNowPrice: null as number | null,
    durationHours: 24,
    itemId: ''
  };

  submit() {
    if (!this.form.itemId) { alert('Selecciona un item'); return; }
    this.create.emit({ ...this.form });
  }
}
