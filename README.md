# Počasí App AK5PM

Školní mobilní aplikace pro sledování počasí vytvořená pomocí Ionic, Angular a Capacitoru. Projekt kombinuje aktuální počasí a krátkodobou předpověď s uživatelskými účty, oblíbenými městy a jednoduchým nastavením aplikace.

## English Summary

This repository contains a school weather application built with Ionic, Angular, and Capacitor. The app supports guest mode and authenticated mode, displays current weather and a 7-day forecast, allows users to manage favorite cities, and uses Firebase Authentication and Firestore for cloud-backed user data.

## Přehled projektu

Aplikace byla navržena jako multiplatformní klient pro Android, iOS a webové spuštění. Uživatel může aplikaci používat bez přihlášení v režimu hosta nebo se přihlásit přes Firebase Authentication a synchronizovat vybraná města a nastavení přes Firestore.

Hlavní části projektu:
- vyhledávání měst a načítání aktuálního počasí z WeatherAPI
- 7denní předpověď pro aktivní město
- správa oblíbených měst
- přihlášení, registrace a reset hesla přes Firebase Auth
- cloudová synchronizace oblíbených měst a nastavení přes Firestore
- lokální fallback ukládání pro režim bez přihlášení

## Funkce aplikace

- Režim hosta i režim přihlášeného uživatele. Viz [`src/app/pages/auth-gate/auth-gate.page.ts`](src/app/pages/auth-gate/auth-gate.page.ts).
- Hlavní obrazovka s aktuálním počasím a 7denní předpovědí. Viz [`src/app/tab1/tab1.page.ts`](src/app/tab1/tab1.page.ts).
- Vyhledávání a správa oblíbených měst. Viz [`src/app/tab2/tab2.page.ts`](src/app/tab2/tab2.page.ts).
- Nastavení aplikace, změna jednotek teploty a práce s účtem. Viz [`src/app/tab3/tab3.page.ts`](src/app/tab3/tab3.page.ts).
- Synchronizace dat mezi lokálním úložištěm a cloudem. Viz [`src/app/services/favorites.service.ts`](src/app/services/favorites.service.ts), [`src/app/services/settings.service.ts`](src/app/services/settings.service.ts), [`src/app/services/cloud.service.ts`](src/app/services/cloud.service.ts).

## Technologie

- Ionic 8
- Angular 20
- Capacitor 8
- TypeScript
- Firebase Authentication
- Cloud Firestore
- WeatherAPI
- RxJS
- SCSS

## Architektura

Projekt je postavený na standalone Angular komponentech a je rozdělený do několika vrstev:

- UI vrstvy: stránky v `src/app/pages/`, `src/app/tab1/`, `src/app/tab2/`, `src/app/tab3/`
- aplikační logika: služby v `src/app/services/`
- konfigurace prostředí: `src/environments/`
- nativní obaly: `android/`, `ios/`

Přehled důležitých souborů:
- routy aplikace: [`src/app/app.routes.ts`](src/app/app.routes.ts)
- bootstrap a globální providery: [`src/main.ts`](src/main.ts)
- služba pro počasí: [`src/app/services/weather.service.ts`](src/app/services/weather.service.ts)
- autentizace: [`src/app/services/auth.service.ts`](src/app/services/auth.service.ts)
- cloudová data: [`src/app/services/cloud.service.ts`](src/app/services/cloud.service.ts)

## Začínáme

### 1. Klonování a instalace

```bash
git clone https://github.com/ONDAAA/Pocasi_app_AK5PM.git
cd Pocasi_app_AK5PM
npm install
```

### 2. Spuštění vývoje

```bash
npm start
```

Aplikace se standardně spustí přes Angular dev server.

### 3. Build

```bash
npm run build
```

### 4. Testy

```bash
npm test
```

### 5. Nativní platformy

Po buildnutí webové části lze synchronizovat změny do Capacitor projektů:

```bash
npx cap sync
```

Případně:

```bash
npx cap open android
npx cap open ios
```

## Konfigurace

Projekt používá dvě hlavní externí služby:
- WeatherAPI pro počasí
- Firebase pro autentizaci a cloudová data

Konfigurace je uložená v:
- [`src/environments/environment.ts`](src/environments/environment.ts)
- [`src/environments/environment.prod.ts`](src/environments/environment.prod.ts)
- [`src/environments/environment.example.ts`](src/environments/environment.example.ts)

Weather API nastavení je nyní centralizované v `environment`, aby nebylo rozptýlené přímo v aplikačních službách.

Pro fork nebo vlastní nasazení lze vyjít z ukázkového souboru:
- [`src/environments/environment.example.ts`](src/environments/environment.example.ts)

## Ukázka konfigurace

```ts
export const environment = {
  production: false,
  weatherApi: {
    baseUrl: 'https://api.weatherapi.com/v1',
    apiKey: 'YOUR_WEATHER_API_KEY',
  },
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
  },
};
```

## Datový model a ukládání

Projekt pracuje se dvěma typy perzistence:

- lokální ukládání přes Preferences / storage služby
- cloudové ukládání přes Firestore po přihlášení uživatele

Příklady:
- oblíbená města: `users/{uid}/favorites/...`
- nastavení uživatele: `users/{uid}/settings/main`

To je implementováno zejména v:
- [`src/app/services/favorites.service.ts`](src/app/services/favorites.service.ts)
- [`src/app/services/cloud.service.ts`](src/app/services/cloud.service.ts)
- [`src/app/services/settings.service.ts`](src/app/services/settings.service.ts)

## Doporučené vstupní body do kódu

- start aplikace: [`src/main.ts`](src/main.ts)
- hlavní počasí a forecast: [`src/app/tab1/tab1.page.ts`](src/app/tab1/tab1.page.ts)
- vyhledávání a správa měst: [`src/app/tab2/tab2.page.ts`](src/app/tab2/tab2.page.ts)
- nastavení a účet: [`src/app/tab3/tab3.page.ts`](src/app/tab3/tab3.page.ts)
- auth gate: [`src/app/pages/auth-gate/auth-gate.page.ts`](src/app/pages/auth-gate/auth-gate.page.ts)

## Licence

Licence zatím není explicitně přidána. Není-li uvedeno jinak, obsah repozitáře zůstává chráněn autorským právem autora.
