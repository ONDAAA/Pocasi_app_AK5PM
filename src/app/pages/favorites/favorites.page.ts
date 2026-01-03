import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage {
  favorites: string[] = [];
  activeCity = '';
  loading = false;

  constructor(private favoritesService: FavoritesService) {}

  async ionViewWillEnter() {
    await this.refresh();
  }

  async refresh() {
    this.loading = true;
    try {
      // list měst (guest/local nebo user/cloud podle service)
      this.favorites = await this.favoritesService.getCities();

      // active city – pokud to ještě nemáš v service hotové, nespadne to
      if (typeof (this.favoritesService as any).getActiveCity === 'function') {
        this.activeCity = await (this.favoritesService as any).getActiveCity();
      } else {
        this.activeCity = this.favorites[0] ?? '';
      }
    } finally {
      this.loading = false;
    }
  }

  async setActive(city: string) {
    // active city – pokud to ještě nemáš v service hotové, nespadne to
    if (typeof (this.favoritesService as any).setActiveCity === 'function') {
      await (this.favoritesService as any).setActiveCity(city);
    } else {
      this.activeCity = city;
    }
    await this.refresh();
  }

  async remove(city: string) {
    await this.favoritesService.removeCity(city);

    // pokud smažeš active city, nastav nový active (pokud máš setActiveCity)
    if (this.activeCity === city) {
      const next = this.favorites.filter((c) => c !== city)[0] ?? '';
      if (typeof (this.favoritesService as any).setActiveCity === 'function') {
        await (this.favoritesService as any).setActiveCity(next);
      }
    }

    await this.refresh();
  }
}