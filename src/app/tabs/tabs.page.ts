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
export class TabsPage implements OnInit, OnDestroy {
  public environmentInjector = inject(EnvironmentInjector);

  private platform = inject(Platform);
  private location = inject(Location);

  private backSub: any;

  constructor() {
    addIcons({ triangle, ellipse, square });
  }

  ngOnInit() {
    // Chytíme Android back tlačítko dřív než default handler.
    this.backSub = this.platform.backButton.subscribeWithPriority(10, async () => {
      const path = window.location.pathname;

      // Root tab routes (tvoje konkrétní)
      const isTabRoot =
        path === '/tabs' ||
        path === '/tabs/tab1' ||
        path === '/tabs/tab2' ||
        path === '/tabs/tab3';

      // Na rootu tabu nechceme "historii mezi taby" -> zavřít appku
      if (isTabRoot) {
        await App.exitApp();
        return;
      }

      // Jinak normální zpět
      this.location.back();
    });
  }

  ngOnDestroy() {
    try {
      this.backSub?.unsubscribe?.();
    } catch {}
  }
}
