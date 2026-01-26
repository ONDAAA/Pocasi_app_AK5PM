import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';

import { addIcons } from 'ionicons';
import {
  partlySunnyOutline, searchOutline, settingsOutline, cloudOutline, trashOutline,
  sunnyOutline, waterOutline, speedometerOutline, personAddOutline, logInOutline,
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { tabTransition } from './app/animations/tab-transition';

// Nastavení Ionic (standalone) + vlastní animace přepínání tabů
provideIonicAngular({ navAnimation: tabTransition });

// Registrace ikon, aby šly používat přes <ion-icon name="...">
addIcons({
  'partly-sunny-outline': partlySunnyOutline,
  'search-outline': searchOutline,
  'settings-outline': settingsOutline,
  'cloud-outline': cloudOutline,
  'trash-outline': trashOutline,
  'sunny-outline': sunnyOutline,
  'water-outline': waterOutline,
  'speedometer-outline': speedometerOutline,
  'person-add-outline': personAddOutline,
  'log-in-outline': logInOutline,
});

// Start celé aplikace a registrace globálních providerů (router, http, firebase…)
bootstrapApplication(AppComponent, {
  providers: [
    // Ionic optimalizace navigace: znovupoužití stránek v tab navigaci
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // Zapnutí Ionic standalone integrace
    provideIonicAngular(),

    // Router + preload všech lazy modulů (rychlejší další přechody, víc dat na začátku)
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // HttpClient pro volání API (počasí)
    provideHttpClient(),

    // Firebase init z environment configu
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
});
