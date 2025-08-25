// room-lobby.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-room-lobby',
  templateUrl: './rooms-lobby.component.html',
  imports: [CommonModule]
})
export class RoomLobbyComponent implements OnInit {
  roomId!: string;
  players: any[] = [];
  isHost: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
  }
}
