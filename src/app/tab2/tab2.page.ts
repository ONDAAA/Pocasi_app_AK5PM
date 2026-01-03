import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-tab2',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  city = '';
  cities: string[] = [];
  activeCity = '';

  constructor(private fav: FavoritesService) {}

  async ngOnInit() {
    await this.refresh();
  }

  async ionViewWillEnter() {
    await this.refresh();
  }

  async refresh() {
    this.cities = await this.fav.getCities();
    this.activeCity = await this.fav.getActiveCity();
  }

  async add() {
    await this.fav.addCity(this.city);
    this.city = '';
    await this.refresh();
  }

  async setActive(c: string) {
    await this.fav.setActiveCity(c);
    await this.refresh();
  }

  async remove(c: string) {
    await this.fav.removeCity(c);
    await this.refresh();
  }
}