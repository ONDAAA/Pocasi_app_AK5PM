import { Component, EnvironmentInjector, OnDestroy, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square } from 'ionicons/icons';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})

// Hlavní stránka s taby aplikace
export class TabsPage implements OnInit, OnDestroy {
  public environmentInjector = inject(EnvironmentInjector); // Pro lazy loaded komponenty v tabech

  // Služby pro platformu a navigaci
  private platform = inject(Platform);
  private location = inject(Location);

  private backSub: any;

  constructor() {
    addIcons({ triangle, ellipse, square });
  }

  // Zpracování hardwarového tlačítka zpět
  ngOnInit() {
    this.backSub = this.platform.backButton.subscribeWithPriority(10, async () => {
      const path = window.location.pathname;

      // Zjistit, zda je uživatel na rootu některého tabu
      const isTabRoot =
        path === '/tabs' ||
        path === '/tabs/tab1' ||
        path === '/tabs/tab2' ||
        path === '/tabs/tab3';

      // Pokud je na rootu tabu, ukončit aplikaci
      if (isTabRoot) {
        await App.exitApp();
        return;
      }

      // Jinak provést navigaci zpět
      this.location.back();
    });
  }

  ngOnDestroy() {
    try {
      this.backSub?.unsubscribe?.();
    } catch {}
  }
}
