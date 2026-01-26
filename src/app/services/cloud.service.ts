import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, getDocs, deleteDoc, serverTimestamp } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { getDoc } from '@angular/fire/firestore';

type TempUnit = 'c' | 'f';

@Injectable({ providedIn: 'root' })

//  Služba pro správu dat v cloudu (Firestore) spojených s uživatelem
export class CloudService {
  constructor(private fs: Firestore, private auth: Auth) {}

  // Získat UID aktuálního přihlášeného uživatele
  private async uid(): Promise<string> {
    if (this.auth.currentUser) return this.auth.currentUser.uid;

    // počkej na auth state change
    return await new Promise<string>((resolve, reject) => {
      const unsub = onAuthStateChanged(this.auth, (u) => {
        unsub();
        if (u) resolve(u.uid);
        else reject(new Error('Not logged in (auth state null)'));
      });

      // safety timeout
      setTimeout(() => {
        try { unsub(); } catch {}
        reject(new Error('Auth timeout waiting for user'));
      }, 4000);
    });
  }

  // Vytvořit ID města z jeho názvu
  private cityId(name: string) {
    return name.trim().toLowerCase().replace(/\s+/g, '-');
  }

  // přidat oblíbené město
  async addFavoriteCity(name: string) {
    const uid = await this.uid();
    const id = this.cityId(name);
    const ref = doc(this.fs, `users/${uid}/favorites/${id}`);
    await setDoc(ref, { name, createdAt: serverTimestamp() });
  }

  // vypsat oblíbená města
  async listFavoriteCities(): Promise<string[]> {
    const uid = await this.uid();
    const ref = collection(this.fs, `users/${uid}/favorites`);
    const snap = await getDocs(ref);
    return snap.docs.map(d => (d.data() as any).name as string);
  }

  // odebrat oblíbené město
  async removeFavoriteCity(name: string) {
    const uid = await this.uid();
    const id = this.cityId(name);
    const ref = doc(this.fs, `users/${uid}/favorites/${id}`);
    await deleteDoc(ref);
  }

  // nastavit uživatelská nastavení
  async setSettings(s: { tempUnit: TempUnit}) {
    const uid = await this.uid();
    const ref = doc(this.fs, `users/${uid}/settings/main`);
    await setDoc(ref, { ...s, updatedAt: serverTimestamp() }, { merge: true });
  }

  // získat uživatelská nastavení
  async getSettings(): Promise<{ tempUnit: TempUnit} | null> {
    const uid = await this.uid();
    const ref = doc(this.fs, `users/${uid}/settings/main`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as any;

    // validace a návrat hodnoty
    return {
        tempUnit: (data.tempUnit === 'f' ? 'f' : 'c'),

    };
  }

}