// rooms-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class RoomsListComponent implements OnInit {
  rooms: any[] = [];
  playerId: string = localStorage.getItem('username') || '';
  showForm = false;
  roomForm!: FormGroup;

  constructor(private battleService: BattleService, private router: Router, private fb: FormBuilder) {}

  ngOnInit() {
    this.loadRooms();

    this.roomForm = this.fb.group({
      id: [''],
      mode: ['1v1'],
      allowAI: [false],
      credits: [100],
      heroLevel: [1],
      ownerId: [this.playerId]
    }); 
  }

  loadRooms() {
    this.battleService.getRooms().subscribe(data => {
      this.rooms = data;
    });
  }

    toggleForm() {
    this.showForm = !this.showForm;
  }

    createRoomSubmit() {
      if (this.roomForm.valid) {
        const roomId = this.roomForm.get('id')?.value;
        this.battleService.createRoom(this.roomForm.value).subscribe(() => {
          this.loadRooms();
          this.showForm = false;
          this.roomForm.reset({
            mode: '1v1',
            allowAI: false,
            credits: 100,
            heroLevel: 1,
            ownerId: this.playerId
          });
        });
        this.joinRoom(roomId);
      }
    }

  joinRoom(roomId: string) {
    const hero = this.battleService.getHeroStatsByPlayerId(this.playerId);
    this.battleService.joinRoom(roomId, this.playerId, hero.hero.level, hero).subscribe(() => {
      this.router.navigate(['/rooms', roomId]);
    });
  }

  getMaxPlayers(mode: string): number {
  switch (mode) {
    case "1v1":
      return 2;
    case "2v2":
      return 4;
    case "3v3":
      return 6;
    default:
      return 0;
  }
}

}
