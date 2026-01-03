import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, getDocs, deleteDoc, serverTimestamp } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { getDoc } from '@angular/fire/firestore';

type TempUnit = 'c' | 'f';

@Injectable({ providedIn: 'root' })
export class CloudService {
  constructor(private fs: Firestore, private auth: Auth) {}

  private async uid(): Promise<string> {
    if (this.auth.currentUser) return this.auth.currentUser.uid;

    // počkej na auth state (race fix)
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

  private cityId(name: string) {
    return name.trim().toLowerCase().replace(/\s+/g, '-');
  }

  async addFavoriteCity(name: string) {
    const uid = await this.uid();
    const id = this.cityId(name);
    const ref = doc(this.fs, `users/${uid}/favorites/${id}`);
    await setDoc(ref, { name, createdAt: serverTimestamp() }, { merge: true });
  }

  async listFavoriteCities(): Promise<string[]> {
    const uid = await this.uid();
    const ref = collection(this.fs, `users/${uid}/favorites`);
    const snap = await getDocs(ref);
    return snap.docs.map(d => (d.data() as any).name as string);
  }

  async removeFavoriteCity(name: string) {
    const uid = await this.uid();
    const id = this.cityId(name);
    const ref = doc(this.fs, `users/${uid}/favorites/${id}`);
    await deleteDoc(ref);
  }

  async setSettings(s: { tempUnit: TempUnit; autoRefresh: boolean; useSystemTheme: boolean }) {
    const uid = await this.uid();
    const ref = doc(this.fs, `users/${uid}/settings/main`);
    await setDoc(ref, { ...s, updatedAt: serverTimestamp() }, { merge: true });
  }

  async getSettings(): Promise<{ tempUnit: TempUnit; autoRefresh: boolean; useSystemTheme: boolean } | null> {
    const uid = await this.uid();
    const ref = doc(this.fs, `users/${uid}/settings/main`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as any;

    return {
        tempUnit: (data.tempUnit === 'f' ? 'f' : 'c'),
        autoRefresh: !!data.autoRefresh,
        useSystemTheme: !!data.useSystemTheme,
    };
  }

}