import { bootstrapApplication } from '@angular/platform-browser';
import {RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules,} from '@angular/router';
import {IonicRouteStrategy, provideIonicAngular,} from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from './environments/environment';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';


import { addIcons } from 'ionicons';
import {
  partlySunnyOutline,
  searchOutline,
  settingsOutline,
  cloudOutline,
  trashOutline,
  sunnyOutline,
  waterOutline,
  speedometerOutline
} from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

addIcons({
  'partly-sunny-outline': partlySunnyOutline,
  'search-outline': searchOutline,
  'settings-outline': settingsOutline,
  'cloud-outline': cloudOutline,
  'trash-outline': trashOutline,
  'sunny-outline': sunnyOutline,
  'water-outline': waterOutline,
  'speedometer-outline': speedometerOutline
});



bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
});
