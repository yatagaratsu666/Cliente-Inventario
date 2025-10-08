import { Injectable } from '@angular/core';

export interface SimpleItem { id?: string; name?: string; image?: string; }

@Injectable({ providedIn: 'root' })
export class MasterResolverService {
  // Intenta recuperar la master como lo hace combate: localStorage y usuario
  resolveFromLocal(user: any): SimpleItem | null {
    // 1) Claves usadas por combate (intentos comunes)
    const lsCandidates = [
      'combat.masterId', 'battle.masterId', 'selectedMasterId',
      'combat.master', 'battle.master', 'equippedItems'
    ];
    for (const key of lsCandidates) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        if (key === 'equippedItems') {
          const eq = JSON.parse(raw);
          const m = eq?.master || eq?.equipados?.master;
          if (m) return this.normalize(m);
        } else {
          const val = JSON.parse(raw);
          if (typeof val === 'string') return { id: val };
          if (val && (val.id || val.name)) return this.normalize(val);
        }
      } catch { /* noop */ }
    }

    // 2) Del backend de usuario: equipados primero
    const eq = (user as any)?.equipados?.master;
    if (Array.isArray(eq) && eq[0]) return this.normalize(eq[0]);

    // 3) Del inventario como fallback
    const inv = (user as any)?.inventario?.master;
    if (Array.isArray(inv) && inv[0]) return this.normalize(inv[0]);

    return null;
  }

  private normalize(x: any): SimpleItem {
    return {
      id: x?.id ?? x?._id ?? x?.code ?? undefined,
      name: x?.name ?? x?.nombre ?? undefined,
      image: x?.image ?? x?.img ?? x?.icon ?? undefined
    };
  }
}