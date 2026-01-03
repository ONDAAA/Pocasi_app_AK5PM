
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

  constructor(private favoritesService: FavoritesService) {}

  async ionViewWillEnter() {
    await this.refresh();
  }

  async refresh() {
    this.favorites = await this.favoritesService.getCities();
    this.activeCity = await this.favoritesService.getActiveCity();
  }

  async setActive(city: string) {
    await this.favoritesService.setActiveCity(city);
    await this.refresh();
  }

  async remove(city: string) {
    await this.favoritesService.removeCity(city);
    await this.refresh();
  }
}
