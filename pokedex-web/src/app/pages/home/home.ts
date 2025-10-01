// src/app/pages/home/home.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  pingResult?: { status: string; message: string };
  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.api.ping().subscribe(res => this.pingResult = res);
  }
}
