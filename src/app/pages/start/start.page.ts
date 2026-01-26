import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppModeService } from '../../services/app-mode.service';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})

// Počáteční stránka aplikace - rozhodnutí o přesměrování podle režimu aplikace
export class StartPage implements OnInit {
  constructor(
    private appMode: AppModeService,
    private router: Router
  ) {}

  // Inicializace stránky - kontrola režimu aplikace a přesměrování
  async ngOnInit() {
    const mode = await this.appMode.getMode();

    // Přesměrování podle režimu aplikace
    if (mode === 'guest' || mode === 'user') {
      await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
      return;
    }
    // Výchozí přesměrování na auth-gate pro výběr režimu
    await this.router.navigateByUrl('/auth-gate', { replaceUrl: true });
  }
}
