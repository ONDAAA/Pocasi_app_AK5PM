import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FavoritesService, FavoriteCity } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage {
  favorites: FavoriteCity[] = [];

  constructor(private favoritesService: FavoritesService) {}

  async ionViewWillEnter() {
    this.favorites = await this.favoritesService.list();
  }

  async remove(name: string) {
    await this.favoritesService.removeByName(name);
    this.favorites = await this.favoritesService.list();
  }
}
