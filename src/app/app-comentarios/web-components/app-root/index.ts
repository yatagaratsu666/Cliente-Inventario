// Importaciones de componentes
import '../filter-bar/index';
import '../comments-list/index';

// Definiciones de tipos locales
type Tipo = 'armor' | 'item' | 'weapon';

interface Reply {
  usuario: string;
  fecha: string;
  texto: string;
}

interface Comment {
  id: number;
  usuario: string;
  fecha: string;
  texto: string;
  valoracion?: number;
  replies?: Reply[];
}

interface ApiItem {
  id: number;
  name?: string;
  nombre?: string;
  description?: string;
  price?: number;
  rarity?: string;
  category?: string;
  image?: string;
  img?: string;
}

// API Services integrados
class ApiService {
  private baseUrl = 'http://34.16.126.78:1802/api';
  // Username-based auth: no token required
  async ensureToken(): Promise<void> { /* no-op */ }

  private currentUser(): string { return localStorage.getItem('username') || ''; }
  private currentRole(): string {
    const raw = (localStorage.getItem('role') || 'player').toLowerCase();
    // Normalize common role variants to expected values on the server
    if (raw.startsWith('admin')) return 'admin'; // e.g., 'admin', 'administrator'
    if (raw === 'jugador' || raw === 'user' || raw === 'usuario') return 'player';
    return raw || 'player';
  }

  public getBaseUrl(): string { return this.baseUrl; }
  public getHost(): string { return this.baseUrl.replace(/\/api\/?$/, ''); }

  // Auth methods
  async login(usuario: string, password: string): Promise<{token: string; usuario: string}> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    
    return response.json();
  }

  async register(usuario: string, password: string): Promise<{message: string}> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    
    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status}`);
    }
    
    return response.json();
  }

  // Items methods
  async getItems(): Promise<ApiItem[]> {
    const response = await fetch(`${this.baseUrl}/items`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status}`);
    }
    
    return response.json();
  }

  async getItemById(id: number): Promise<ApiItem> {
    const response = await fetch(`${this.baseUrl}/items/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch item: ${response.status}`);
    }
    
    return response.json();
  }

  // Armors methods
  async getArmors(): Promise<ApiItem[]> {
    const response = await fetch(`${this.baseUrl}/armors`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch armors: ${response.status}`);
    }
    
    return response.json();
  }

  async getArmorById(id: number): Promise<ApiItem> {
    const response = await fetch(`${this.baseUrl}/armors/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch armor: ${response.status}`);
    }
    
    return response.json();
  }

  // Weapons methods
  async getWeapons(): Promise<ApiItem[]> {
    const response = await fetch(`${this.baseUrl}/weapons`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weapons: ${response.status}`);
    }
    
    return response.json();
  }

  async getWeaponById(id: number): Promise<ApiItem> {
    const response = await fetch(`${this.baseUrl}/weapons/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weapon: ${response.status}`);
    }
    
    return response.json();
  }

  // Comments methods
  async getComments(tipo: Tipo, id: number, opts?: { orderBy?: 'fecha'|'valoracion'; order?: 'asc'|'desc'; limit?: number; skip?: number }): Promise<Comment[]> {
    const params = new URLSearchParams();
    if (opts?.orderBy) params.set('orderBy', opts.orderBy);
    if (opts?.order) params.set('order', opts.order);
    if (typeof opts?.limit === 'number') params.set('limit', String(opts.limit));
    if (typeof opts?.skip === 'number') params.set('skip', String(opts.skip));
    const qs = params.toString();
    const response = await fetch(`${this.baseUrl}/${tipo}/${id}/comments${qs ? `?${qs}` : ''}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    
    return response.json();
  }

  async createComment(tipo: Tipo, id: number, commentData: {
    texto: string;
    valoracion?: number;
  }): Promise<Comment> {
    
    const body = new URLSearchParams();
    body.set('comentario', commentData.texto);
    if (typeof commentData.valoracion !== 'undefined') body.set('valoracion', String(commentData.valoracion));
    body.set('usuario', this.currentUser());
    const response = await fetch(`${this.baseUrl}/${tipo}/${id}/comments`, {
      method: 'POST',
      body
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create comment: ${response.status}`);
    }
    
    return response.json();
  }

  async updateComment(tipo: Tipo, itemId: number, commentId: string, commentData: {
    texto: string;
    valoracion?: number;
  }): Promise<Comment> {
    // Build payload expected by server: { comentario, valoracion?, usuario, role }
    const payload: any = {
      usuario: this.currentUser(),
      role: this.currentRole(),
    };
    if (typeof commentData.texto !== 'undefined') {
      payload.comentario = commentData.texto;
    }
    if (typeof commentData.valoracion === 'number' && Number.isFinite(commentData.valoracion)) {
      const v = Math.round(commentData.valoracion);
      payload.valoracion = Math.max(1, Math.min(5, v));
    }
    const response = await fetch(`${this.baseUrl}/${tipo}/${itemId}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update comment: ${response.status}`);
    }
    
    return response.json();
  }

  async deleteComment(tipo: Tipo, itemId: number, commentId: string): Promise<void> {
    const usuario = encodeURIComponent(this.currentUser());
    const role = encodeURIComponent(this.currentRole());
    const url = `${this.baseUrl}/${tipo}/${itemId}/comments/${commentId}?usuario=${usuario}&role=${role}`;
    const response = await fetch(url, { method: 'DELETE' });
    
    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.status}`);
    }
  }

  async createReply(tipo: Tipo, itemId: number, commentId: string, replyData: {
    texto: string;
  }): Promise<Reply> {
    const body = new URLSearchParams();
    body.set('comentario', replyData.texto);
    body.set('usuario', this.currentUser());
    const response = await fetch(`${this.baseUrl}/${tipo}/${itemId}/comments/${commentId}/replies`, {
      method: 'POST',
      body
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create reply: ${response.status}`);
    }
    
    return response.json();
  }

  async getSummary(tipo: Tipo, id: number): Promise<{
    totalComments: number;
    averageRating: number;
  }> {
    const response = await fetch(`${this.baseUrl}/comments/${tipo}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch summary: ${response.status}`);
    }
    
    return response.json();
  }
}

// Instancia global del servicio API
const apiService = new ApiService();

// Template HTML inline
const tplRaw = `<div id="loading-mask" hidden>
  <div class="box">Cargando…</div>
  </div>
<div id="toast" class="toast" hidden></div>
<!-- Not logged view -->
<div class="container" id="not-logged-view" hidden>
  <h1>Login requerido</h1>
  <login-panel></login-panel>
</div>

<!-- Logged view -->
<div class="container" id="logged-view" hidden>
  <filter-bar></filter-bar>
  <section class="card section">
    <h2>Items</h2>
    <div class="items-grid" id="items-grid"></div>
  </section>
  <section class="card section">
    <h2>Armors</h2>
    <div class="items-grid" id="armors-grid"></div>
  </section>
  <section class="card section">
    <h2>Weapons</h2>
    <div class="items-grid" id="weapons-grid"></div>
  </section>
</div>

<!-- Modal template -->
<template id="tpl-modal">
  <div class="cc-modal-overlay">
    <div class="cc-modal" role="dialog" aria-modal="true">
      <div class="cc-modal-header">
        <span>Comentarios</span>
        <div class="header-actions">
          <button id="cc-new">Nuevo comentario</button>
          <button id="cc-close-modal" aria-label="Cerrar">✕</button>
        </div>
      </div>
      <div class="cc-modal-body">
        <div class="cc-controls row">
          <label>Ordenar por
            <select id="cc-orderBy">
              <option value="fecha">Fecha</option>
              <option value="valoracion">Valoración</option>
            </select>
          </label>
          <label>Orden
            <select id="cc-order">
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </label>
          <button id="cc-apply">Aplicar</button>
        </div>
        <div id="cc-msg" class="msg" style="display:none"></div>
        <div id="cc-loading" class="loading">Cargando comentarios…</div>
        <comments-list id="cc-list" style="display:none"></comments-list>
      </div>
    </div>
  </div>
  </template>

<!-- Inline editor template -->
<template id="tpl-editor">
  <div class="cc-editor">
    <h3 class="ed-title">Nuevo comentario</h3>
    <div class="row">
      <textarea id="cc-ed-text" placeholder="Escribe tu comentario..."></textarea>
    </div>
    <div class="row">
      <label for="cc-ed-val">Valoración (1-5, opcional)</label>
      <input id="cc-ed-val" type="number" min="1" max="5" value="5">
    </div>
    <div class="buttons">
      <button id="cc-ed-cancel" class="secondary">Cancelar</button>
      <button id="cc-ed-save">Guardar</button>
    </div>
  </div>
</template>

<!-- Confirm template -->
<template id="tpl-confirm">
  <div class="cc-confirm-overlay">
    <div class="cc-confirm" role="dialog" aria-modal="true">
      <h3>Confirmación</h3>
      <div class="cc-confirm-message">¿Seguro?</div>
      <div class="cc-confirm-buttons">
        <button id="cc-cancel">Cancelar</button>
        <button id="cc-accept" class="danger">Eliminar</button>
      </div>
    </div>
  </div>
</template>`;

// Estilos CSS inline  
const cssRaw = `:host { all: initial; font-family: Arial, Helvetica, sans-serif; color: #eaf6f6 }
.container { max-width: 1100px; margin: 0 auto; padding: 16px }
.row { display:flex; gap:12px }
.card { background: #0d1b2a; border:1px solid #56cfe1; border-radius:10px; padding:12px }
h1,h2 { margin:0 0 10px 0; color: #eaf6f6 }
/* Unified buttons (app accent) */
button { height:32px; padding:0 12px; border-radius:6px; border:2px solid #56cfe1; background:#56cfe1; color:#0d1b2a; cursor:pointer }
button:hover { background:#48bfe3; border-color:#48bfe3 }
button:disabled { opacity:.7; cursor:default }
/* Items grid visuals */
.items-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:12px; }
.item-card { background:#0d1b2a; border:1px solid #56cfe1; border-radius:8px; padding:8px; text-align:center; cursor:pointer; transition: transform .1s, box-shadow .2s; }
.item-card:hover { transform: translateY(-2px); box-shadow:0 0 12px rgba(86,207,225,0.4); }
.item-card img { width:100%; height:120px; object-fit:cover; border-radius:6px; border:2px solid #56cfe1; background:#000; }
.item-name { margin-top:6px; font-size:.9rem; }
.item-avg { margin-top:4px; font-size:.85rem; color:#eaf6f6 }
/* Loading mask */
#loading-mask { position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter: blur(2px); display:flex; align-items:center; justify-content:center; z-index:9998 }
#loading-mask[hidden] { display:none }
#loading-mask .box { background:#0d1b2a; border:1px solid #56cfe1; border-radius:8px; padding:10px; color:#eaf6f6; box-shadow:0 0 12px rgba(86,207,225,0.3) }
/* Toast */
.toast { position:fixed; left:50%; transform:translateX(-50%); bottom:20px; background:#0d1b2a; color:#eaf6f6; border:1px solid #56cfe1; border-radius:8px; padding:10px 14px; box-shadow:0 4px 16px rgba(0,0,0,0.4); z-index:2147483646; }
.toast.success { border-color:#2e8b57; box-shadow:0 0 10px rgba(46,139,87,0.5) }
.toast.error { border-color:#c43c3c; box-shadow:0 0 10px rgba(196,60,60,0.5) }
/* Top actions row spacing */
.top-actions { margin-top:12px; align-items:center; gap:12px }
/* Section spacing */
.section { margin-top:16px }
/* Flex filler */
.flex1 { flex:1 }
/* Modal visuals */
.cc-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2147483647; animation: cc-fade .12s ease-out }
.cc-modal { width:min(900px, 96vw); max-height:90vh; background:#0d1b2a; border:2px solid #56cfe1; border-radius:10px; box-shadow:0 0 20px rgba(86,207,225,0.3); display:flex; flex-direction:column; color:#eaf6f6; transform:scale(.985); opacity:0; animation: cc-pop .12s ease-out forwards }
.cc-modal-header { display:flex; justify-content:space-between; align-items:center; padding:12px; color:#eaf6f6; background:linear-gradient(160deg,#0d1b2a,#1b2b43); border-bottom:1px solid #56cfe1; }
.cc-modal-header .header-actions { display:flex; gap:8px; align-items:center }
.cc-modal-body { padding:12px; overflow:auto; }
.msg { margin: 0 0 10px 0; padding:8px 10px; border-radius:6px; border:1px solid #56cfe1; background:#0d1b2a; }
.msg.success { border-color:#2e8b57 }
.msg.error { border-color:#c43c3c }
.loading { opacity:0.8; font-style:italic }
/* Confirm */
.cc-confirm-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2147483647; }
.cc-confirm { width:min(420px, 92vw); background:#0d1b2a; border:1px solid #56cfe1; border-radius:10px; padding:14px; box-shadow:0 0 16px rgba(86,207,225,0.3); }
.cc-confirm h3 { margin:0 0 8px 0; font-size:1rem; color:#eaf6f6 }
.cc-confirm .cc-confirm-buttons { display:flex; gap:8px; justify-content:flex-end; margin-top:10px }
.cc-confirm button { background:#56cfe1; color:#0d1b2a; border:2px solid #56cfe1; border-radius:6px; padding:6px 12px; cursor:pointer }
.cc-confirm .danger { background:#c43c3c; border-color:#c43c3c; color:#fff }
/* Editor */
.cc-editor { margin:10px 0; padding:10px; border:1px solid #56cfe1; border-radius:8px; background:#0d1b2a }
.cc-editor h3 { margin:0 0 8px 0; font-size:1rem }
.cc-editor .row { display:flex; gap:8px; align-items:center; flex-wrap:wrap }
.cc-editor textarea { width:100%; min-height:80px; padding:8px; border-radius:6px; border:1px solid #56cfe1; background:#0d1b2a; color:#eaf6f6; box-sizing:border-box }
.cc-editor input[type="number"] { width:80px; height:32px; padding:6px 8px; border-radius:6px; border:1px solid #56cfe1; background:#0d1b2a; color:#eaf6f6 }
.cc-editor .buttons { display:flex; gap:8px; justify-content:flex-end; margin-top:8px }
.cc-editor button { background:#56cfe1; color:#0d1b2a; border:2px solid #56cfe1; border-radius:6px; padding:6px 12px; cursor:pointer }
.cc-editor .secondary { background:transparent; color:#eaf6f6; border-color:#56cfe1 }
/* Image placeholder */
.img-placeholder { width:100%; height:120px; border-radius:6px; border:2px solid #56cfe1; background:#0d1b2a; }
/* Real image styling */
.img { width:100%; height:120px; object-fit: cover; border-radius:6px; border:2px solid #56cfe1; background:#0d1b2a; }
/* Animations */
@keyframes cc-fade { from { background: rgba(0,0,0,0) } to { background: rgba(0,0,0,0.5) } }
@keyframes cc-pop { from { transform:scale(.985); opacity:0 } to { transform:scale(1); opacity:1 } }`;

function loadTokenFromStorage() {
  // Usa únicamente el token del servicio de comentarios ('token') si existe
  const token = localStorage.getItem('token');
  return !!token;
}

interface State {
  tipo: Tipo;
  idOrOid: string;
  orderBy: string;
  order: string;
  name: string;
  loading: boolean;
  summary: any;
  comments: Comment[];
  isAdmin: boolean;
  loggedUser?: string;
  user: string;
  pass: string;
  items: ApiItem[];
  armors: ApiItem[];
  weapons: ApiItem[];
  avgCache: {[key: string]: number};
  toast: {text: string; type: 'info'|'success'|'error'} | null;
}

class AppRoot extends HTMLElement {
  logged: boolean = false;
  private eventsBound = false;
  state: State = {
    tipo: 'item',
    idOrOid: '1',
    orderBy: 'fecha',
    order: 'desc',
    name: '',
    loading: false,
    summary: null,
    comments: [],
    isAdmin: false,
    loggedUser: undefined,
    user: '',
    pass: '',
    items: [],
    armors: [],
    weapons: [],
    avgCache: {},
    toast: null,
  };

  constructor(){ super(); this.attachShadow({ mode: 'open' }); }

  async connectedCallback(){
    // Si no hay sesión, redirige al login de la app principal
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    if (!isLoggedIn) {
      window.location.replace('/login');
      return;
    }

    loadTokenFromStorage();
    // Read role and username from main app
    const role = (localStorage.getItem('role') || 'player').toLowerCase();
    const username = localStorage.getItem('username') || '';
    // Consider both 'admin' and 'administrator' as admin
    this.state.isAdmin = role.startsWith('admin');
    this.state.loggedUser = username;
    // Omitimos token Bearer; identidad por nombre
    (this as any).logged = true;
    await this.render();
    await Promise.all([this.loadItems(), this.loadArmors(), this.loadWeapons()]);
  }

  setState(partial: Partial<State>){ this.state = { ...this.state, ...partial }; this.render(); }

  showToast(text: string, type: 'info'|'success'|'error' = 'info', timeout = 3000){
    this.state.toast = { text, type };
    this.render();
    if (timeout > 0) setTimeout(() => { this.state.toast = null; this.render(); }, timeout);
  }

  async doLogin(){
    // Ya no es necesario - el usuario ya está autenticado en el sistema principal
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    if (isLoggedIn) {
      this.showToast('Ya estás autenticado con el sistema principal', 'info');
      return;
    }
    
    // Redirigir al login principal si no está autenticado
    window.location.href = '/login';
  }

  doLogout(){
    // Limpiar estado de sesión usado por la app principal
    try {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
    } catch {}

    // Opcional: resetear estado local del componente
    this.state.isAdmin = false;
    this.state.loggedUser = undefined;

    // Navegar a la ruta de login de la app Angular
    // replace() evita que el usuario regrese con back
    window.location.replace('/login');
  }

  async render(){
    if (!this.shadowRoot) this.attachShadow({ mode:'open' });
    const logged = localStorage.getItem('loggedIn') === 'true';
    if (!logged) {
      window.location.replace('/login');
      return;
    }

    this.shadowRoot!.innerHTML = `
      <style>${cssRaw}</style>
      ${tplRaw}
    `;

    // Show/hide views based on login state
    const notLoggedView = this.shadowRoot!.getElementById('not-logged-view');
    const loggedView = this.shadowRoot!.getElementById('logged-view');
    const toast = this.shadowRoot!.getElementById('toast');

    if (notLoggedView && loggedView) {
      // Siempre mostrar la vista logueada (login ya es parte de la app principal)
      (notLoggedView as HTMLElement).hidden = true;
      (loggedView as HTMLElement).hidden = false;
      this.renderLoggedView();

      // Configurar barra de filtros
      const fb = this.shadowRoot!.querySelector('filter-bar') as any;
      if (fb) {
        fb.data = { name: this.state.name, loading: this.state.loading };
        fb.addEventListener('change-name', (e: any) => {
          this.state.name = String(e.detail || '');
          this.renderLoggedView();
        });
        fb.addEventListener('refresh', async () => {
          await Promise.all([this.loadItems(), this.loadArmors(), this.loadWeapons()]);
        });
      }
    }

    // Toast handling
    if (toast && this.state.toast) {
      toast.textContent = this.state.toast.text;
      toast.className = `toast ${this.state.toast.type}`;
      toast.hidden = false;
    } else if (toast) {
      toast.hidden = true;
    }

    this.bindEvents();
  }

  renderLoggedView() {
    const itemsGrid = this.shadowRoot?.getElementById('items-grid');
    const armorsGrid = this.shadowRoot?.getElementById('armors-grid');
    const weaponsGrid = this.shadowRoot?.getElementById('weapons-grid');
    const filterByName = <T extends { name?: string; nombre?: string }>(arr: T[], name?: string): T[] => {
      if (!name) return arr;
      const q = name.trim().toLowerCase();
      return arr.filter(x => ((x.name as any) || (x as any).nombre || '').toLowerCase().includes(q));
    };

    if (itemsGrid) {
      const apiHost = apiService.getHost();
      const list = filterByName(this.state.items, this.state.name);
      itemsGrid.innerHTML = list.map(item => {
        const name = item.name || (item as any).nombre || 'Sin nombre';
        const rawImg = item.image || (item as any).img;
        const img = rawImg ? (/^(https?:|data:|\/\/)/.test(rawImg) ? rawImg : `${apiHost}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : undefined;
        const avg = this.state.avgCache[`item-${item.id}`];
        return `
        <div class="item-card" data-tipo="item" data-id="${item.id}">
          ${img ? `<img class="img" src="${img}" alt="${name}"/>` : '<div class="img-placeholder"></div>'}
          <div class="item-name">${name}</div>
          <div class="item-avg">★ ${typeof avg === 'number' ? avg.toFixed(1) : 'N/A'}</div>
        </div>`;
      }).join('');
    }

    if (armorsGrid) {
      const apiHost = apiService.getHost();
      const list = filterByName(this.state.armors, this.state.name);
      armorsGrid.innerHTML = list.map(armor => {
        const name = armor.name || (armor as any).nombre || 'Sin nombre';
        const rawImg = armor.image || (armor as any).img;
        const img = rawImg ? (/^(https?:|data:|\/\/)/.test(rawImg) ? rawImg : `${apiHost}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : undefined;
        const avg = this.state.avgCache[`armor-${armor.id}`];
        return `
        <div class="item-card" data-tipo="armor" data-id="${armor.id}">
          ${img ? `<img class="img" src="${img}" alt="${name}"/>` : '<div class="img-placeholder"></div>'}
          <div class="item-name">${name}</div>
          <div class="item-avg">★ ${typeof avg === 'number' ? avg.toFixed(1) : 'N/A'}</div>
        </div>`;
      }).join('');
    }

    if (weaponsGrid) {
      const apiHost = apiService.getHost();
      const list = filterByName(this.state.weapons, this.state.name);
      weaponsGrid.innerHTML = list.map(weapon => {
        const name = weapon.name || (weapon as any).nombre || 'Sin nombre';
        const rawImg = weapon.image || (weapon as any).img;
        const img = rawImg ? (/^(https?:|data:|\/\/)/.test(rawImg) ? rawImg : `${apiHost}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : undefined;
        const avg = this.state.avgCache[`weapon-${weapon.id}`];
        return `
        <div class="item-card" data-tipo="weapon" data-id="${weapon.id}">
          ${img ? `<img class="img" src="${img}" alt="${name}"/>` : '<div class="img-placeholder"></div>'}
          <div class="item-name">${name}</div>
          <div class="item-avg">★ ${typeof avg === 'number' ? avg.toFixed(1) : 'N/A'}</div>
        </div>`;
      }).join('');
    }
  }

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;
    // Delegación de eventos sobre el shadow root (sobrevive a re-renders)
    this.shadowRoot?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      // Item card clicks
      const card = target.closest('.item-card') as HTMLElement;
      if (card) {
        const tipo = card.dataset['tipo'] as Tipo;
        const id = card.dataset['id'];
        if (tipo && id) {
          this.openCommentsModal(tipo, id);
        }
      }
    });
  }

  async loadItems() {
    try {
      const items = await apiService.getItems();
      this.state.items = items;
      // Load averages for items
      for (const item of items) {
        try {
          const summary = await apiService.getSummary('item', item.id);
          const avg = (summary as any).averageRating ?? (summary as any).stats?.average ?? 0;
          this.state.avgCache[`item-${item.id}`] = typeof avg === 'number' ? avg : Number(avg) || 0;
        } catch (e) {
          this.state.avgCache[`item-${item.id}`] = 0;
        }
      }
      this.render();
    } catch (error) {
      console.error('Error loading items:', error);
      this.showToast('Error cargando items', 'error');
    }
  }

  async loadArmors() {
    try {
      const armors = await apiService.getArmors();
      this.state.armors = armors;
      // Load averages for armors
      for (const armor of armors) {
        try {
          const summary = await apiService.getSummary('armor', armor.id);
          const avg = (summary as any).averageRating ?? (summary as any).stats?.average ?? 0;
          this.state.avgCache[`armor-${armor.id}`] = typeof avg === 'number' ? avg : Number(avg) || 0;
        } catch (e) {
          this.state.avgCache[`armor-${armor.id}`] = 0;
        }
      }
      this.render();
    } catch (error) {
      console.error('Error loading armors:', error);
      this.showToast('Error cargando armaduras', 'error');
    }
  }

  async loadWeapons() {
    try {
      const weapons = await apiService.getWeapons();
      this.state.weapons = weapons;
      // Load averages for weapons
      for (const weapon of weapons) {
        try {
          const summary = await apiService.getSummary('weapon', weapon.id);
          const avg = (summary as any).averageRating ?? (summary as any).stats?.average ?? 0;
          this.state.avgCache[`weapon-${weapon.id}`] = typeof avg === 'number' ? avg : Number(avg) || 0;
        } catch (e) {
          this.state.avgCache[`weapon-${weapon.id}`] = 0;
        }
      }
      this.render();
    } catch (error) {
      console.error('Error loading weapons:', error);
      this.showToast('Error cargando armas', 'error');
    }
  }

  openCommentsModal(tipo: Tipo, id: string) {
    const modal = this.shadowRoot?.getElementById('tpl-modal') as HTMLTemplateElement;
    if (modal && this.shadowRoot) {
      // If a modal is already open, remove it to avoid duplicates
      const existing = this.shadowRoot.querySelector('.cc-modal-overlay');
      existing?.remove();
      // Append modal inside shadow root to keep styles and structure self-contained
      const clone = document.importNode(modal.content, true);
      this.shadowRoot.appendChild(clone);

      // Configure modal for the specific item
      this.state.tipo = tipo;
      this.state.idOrOid = id;

      // Load comments
      this.loadComments();

      // Bind modal events scoped to shadow root
      const closeBtn = this.shadowRoot.getElementById('cc-close-modal');
      closeBtn?.addEventListener('click', () => this.closeModal());

      const newBtn = this.shadowRoot.getElementById('cc-new');
      newBtn?.addEventListener('click', () => this.showNewCommentEditor());

      // Init order selectors
      const orderBySel = this.shadowRoot.getElementById('cc-orderBy') as HTMLSelectElement | null;
      const orderSel = this.shadowRoot.getElementById('cc-order') as HTMLSelectElement | null;
      const applyBtn = this.shadowRoot.getElementById('cc-apply');
      if (orderBySel) orderBySel.value = this.state.orderBy;
      if (orderSel) orderSel.value = this.state.order;
      applyBtn?.addEventListener('click', async () => {
        if (orderBySel) this.state.orderBy = orderBySel.value as any;
        if (orderSel) this.state.order = orderSel.value as any;
        // Show loading and hide list during refresh
        const msg = this.shadowRoot?.getElementById('cc-msg');
        const loading = this.shadowRoot?.getElementById('cc-loading');
        const list = this.shadowRoot?.getElementById('cc-list');
        if (msg) { msg.style.display = 'none'; }
        if (list) { (list as HTMLElement).style.display = 'none'; }
        if (loading) { (loading as HTMLElement).style.display = 'block'; }
        await this.loadComments();
      });

      // Wire actions from comment items (bubbling events)
      const onReply = (e: Event) => {
        const ce = e as CustomEvent<string>;
        this.handleReply(ce.detail);
      };
      const onEdit = (e: Event) => {
        const ce = e as CustomEvent<string>;
        this.handleEdit(ce.detail);
      };
      const onDelete = (e: Event) => {
        const ce = e as CustomEvent<string>;
        this.handleDelete(ce.detail);
      };
      // attach on shadow root so it catches composed+bubbling events
      this.shadowRoot.addEventListener('reply', onReply);
      this.shadowRoot.addEventListener('edit', onEdit);
      this.shadowRoot.addEventListener('delete', onDelete);

      // Clean up listeners when modal closes
      const cleanup = () => {
        this.shadowRoot?.removeEventListener('reply', onReply);
        this.shadowRoot?.removeEventListener('edit', onEdit);
        this.shadowRoot?.removeEventListener('delete', onDelete);
      };
      closeBtn?.addEventListener('click', cleanup);
    }
  }

  closeModal() {
    const overlay = this.shadowRoot?.querySelector('.cc-modal-overlay');
    overlay?.remove();
  }

  async loadComments() {
    try {
      const comments = await apiService.getComments(this.state.tipo, parseInt(this.state.idOrOid), { orderBy: this.state.orderBy as any, order: this.state.order as any });
      this.state.comments = comments;
      
      const commentsList = this.shadowRoot?.getElementById('cc-list') as any;
      if (commentsList) {
        commentsList.data = { comments, isAdmin: this.state.isAdmin, username: this.state.loggedUser };
        commentsList.style.display = 'block';
      }
      
      const loading = this.shadowRoot?.getElementById('cc-loading');
      if (loading) loading.style.display = 'none';
    } catch (error) {
      console.error('Error loading comments:', error);
      const msg = this.shadowRoot?.getElementById('cc-msg');
      if (msg) {
        msg.textContent = 'Error cargando comentarios';
        msg.className = 'msg error';
        msg.style.display = 'block';
      }
    }
  }

  showNewCommentEditor() {
    const editorTemplate = this.shadowRoot?.getElementById('tpl-editor') as HTMLTemplateElement;
    if (editorTemplate) {
  const clone = document.importNode(editorTemplate.content, true);
  const modalBody = this.shadowRoot?.querySelector('.cc-modal-body');
  // Evita múltiples editores abiertos
  this.shadowRoot?.querySelector('.cc-editor')?.remove();
  modalBody?.appendChild(clone);
      
      // Bind editor events
  const saveBtn = this.shadowRoot?.getElementById('cc-ed-save');
  const cancelBtn = this.shadowRoot?.getElementById('cc-ed-cancel');
  const titleEl = this.shadowRoot?.querySelector('.cc-editor .ed-title');
  if (titleEl) titleEl.textContent = 'Nuevo comentario';
      
      saveBtn?.addEventListener('click', () => this.saveNewComment());
      cancelBtn?.addEventListener('click', () => {
        this.shadowRoot?.querySelector('.cc-editor')?.remove();
      });
    }
  }

  private showReplyEditor(commentId: string) {
    const editorTemplate = this.shadowRoot?.getElementById('tpl-editor') as HTMLTemplateElement;
    if (!editorTemplate) return;
    const clone = document.importNode(editorTemplate.content, true);
    const modalBody = this.shadowRoot?.querySelector('.cc-modal-body');
    // Cierra otro editor si existe
    this.shadowRoot?.querySelector('.cc-editor')?.remove();
    modalBody?.appendChild(clone);

    // Ajustes de UI: título y ocultar valoración
    const titleEl = this.shadowRoot?.querySelector('.cc-editor .ed-title');
    if (titleEl) titleEl.textContent = 'Responder comentario';
    const valInput = this.shadowRoot?.getElementById('cc-ed-val') as HTMLInputElement | null;
    if (valInput) {
      const row = valInput.closest('.row') as HTMLElement | null;
      if (row) row.style.display = 'none';
    }

    const saveBtn = this.shadowRoot?.getElementById('cc-ed-save');
    const cancelBtn = this.shadowRoot?.getElementById('cc-ed-cancel');
    saveBtn?.addEventListener('click', async () => {
      const textArea = this.shadowRoot?.getElementById('cc-ed-text') as HTMLTextAreaElement;
      const texto = (textArea?.value || '').trim();
      if (!texto) return;
      try {
        await apiService.createReply(this.state.tipo, parseInt(this.state.idOrOid), String(commentId), { texto });
        this.shadowRoot?.querySelector('.cc-editor')?.remove();
        await this.loadComments();
        const msg = this.shadowRoot?.getElementById('cc-msg');
        if (msg) { msg.textContent = 'Respuesta creada'; msg.className = 'msg success'; msg.style.display = 'block'; }
      } catch (e) {
        const msg = this.shadowRoot?.getElementById('cc-msg');
        if (msg) { msg.textContent = 'Error creando respuesta'; msg.className = 'msg error'; msg.style.display = 'block'; }
      }
    });
    cancelBtn?.addEventListener('click', () => {
      this.shadowRoot?.querySelector('.cc-editor')?.remove();
    });
  }

  private showEditEditor(commentId: string) {
    if (!this.state.isAdmin) {
      const msg = this.shadowRoot?.getElementById('cc-msg');
      if (msg) { msg.textContent = 'No tienes permisos para editar'; msg.className = 'msg error'; msg.style.display = 'block'; }
      return;
    }
    // Buscar el comentario actual para prellenar
    const target = this.state.comments.find(c => String((c as any)._id || (c as any).id) === String(commentId)) as any;
    const currTexto = target?.texto || target?.comentario || '';
    const currVal = typeof target?.valoracion === 'number' ? target.valoracion : undefined;

    const editorTemplate = this.shadowRoot?.getElementById('tpl-editor') as HTMLTemplateElement;
    if (!editorTemplate) return;
    const clone = document.importNode(editorTemplate.content, true);
    const modalBody = this.shadowRoot?.querySelector('.cc-modal-body');
    this.shadowRoot?.querySelector('.cc-editor')?.remove();
    modalBody?.appendChild(clone);

    // Ajustar título y valores actuales
    const titleEl = this.shadowRoot?.querySelector('.cc-editor .ed-title');
    if (titleEl) titleEl.textContent = 'Editar comentario';
    const textArea = this.shadowRoot?.getElementById('cc-ed-text') as HTMLTextAreaElement | null;
    if (textArea) textArea.value = String(currTexto || '');
    const valInput = this.shadowRoot?.getElementById('cc-ed-val') as HTMLInputElement | null;
    if (valInput && typeof currVal === 'number') valInput.value = String(currVal);

    const saveBtn = this.shadowRoot?.getElementById('cc-ed-save');
    const cancelBtn = this.shadowRoot?.getElementById('cc-ed-cancel');
    saveBtn?.addEventListener('click', async () => {
      const texto = (textArea?.value || '').trim();
      if (!texto) {
        const msg = this.shadowRoot?.getElementById('cc-msg');
        if (msg) { msg.textContent = 'El texto no puede estar vacío'; msg.className = 'msg error'; msg.style.display = 'block'; }
        return;
      }
      let valNum: number | undefined = undefined;
      if (valInput) {
        const parsed = Number.parseInt(valInput.value, 10);
        if (Number.isFinite(parsed)) {
          valNum = Math.max(1, Math.min(5, parsed));
        }
      }
      try {
        await apiService.updateComment(this.state.tipo, parseInt(this.state.idOrOid), String(commentId), { texto, valoracion: valNum });
        this.shadowRoot?.querySelector('.cc-editor')?.remove();
        await this.loadComments();
        const msg = this.shadowRoot?.getElementById('cc-msg');
        if (msg) { msg.textContent = 'Comentario actualizado'; msg.className = 'msg success'; msg.style.display = 'block'; }
      } catch (e) {
        const msg = this.shadowRoot?.getElementById('cc-msg');
        if (msg) { msg.textContent = 'Error actualizando comentario'; msg.className = 'msg error'; msg.style.display = 'block'; }
      }
    });
    cancelBtn?.addEventListener('click', () => {
      this.shadowRoot?.querySelector('.cc-editor')?.remove();
    });
  }

  async saveNewComment() {
  const textArea = this.shadowRoot?.getElementById('cc-ed-text') as HTMLTextAreaElement;
  const valInput = this.shadowRoot?.getElementById('cc-ed-val') as HTMLInputElement;
    
    const texto = (textArea?.value || '').trim();
    if (!texto) {
      const msg = this.shadowRoot?.getElementById('cc-msg');
      if (msg) { msg.textContent = 'El texto no puede estar vacío'; msg.className = 'msg error'; msg.style.display = 'block'; }
      return;
    }
    try {
      // Valoración por defecto a 5 si está vacía o no es válida
      let valoracion = 5;
      if (valInput) {
        const parsed = Number.parseInt(valInput.value, 10);
        if (Number.isFinite(parsed)) {
          valoracion = Math.max(1, Math.min(5, parsed));
        }
      }
      await apiService.createComment(this.state.tipo, parseInt(this.state.idOrOid), { texto, valoracion });

      // Remove editor and reload comments
      this.shadowRoot?.querySelector('.cc-editor')?.remove();
      await this.loadComments();

      const msg = this.shadowRoot?.getElementById('cc-msg');
      if (msg) {
        msg.textContent = 'Comentario creado exitosamente';
        msg.className = 'msg success';
        msg.style.display = 'block';
      }
    } catch (error: any) {
      console.error('Error creating comment:', error);
      const msg = this.shadowRoot?.getElementById('cc-msg');
      if (msg) { msg.textContent = 'Error creando comentario'; msg.className = 'msg error'; msg.style.display = 'block'; }
    }
  }

  private async handleReply(commentId: string){
    this.showReplyEditor(String(commentId));
  }

  private async handleEdit(commentId: string){
    this.showEditEditor(String(commentId));
  }

  private async handleDelete(commentId: string){
    // Permisos: admin o dueño del comentario
    const target = this.state.comments.find(c => String((c as any)._id || (c as any).id) === String(commentId));
    const currentUser = this.state.loggedUser || '';
    const isOwner = target ? (target as any).usuario === currentUser : false;
    if (!(this.state.isAdmin || isOwner)) {
      const msg = this.shadowRoot?.getElementById('cc-msg');
      if (msg) { msg.textContent = 'No puedes eliminar este comentario'; msg.className = 'msg error'; msg.style.display = 'block'; }
      return;
    }
    const tpl = this.shadowRoot?.getElementById('tpl-confirm') as HTMLTemplateElement;
    if (!tpl || !this.shadowRoot) return;
    // Append first, then query the appended overlay instance to avoid stale refs
    const fragment = document.importNode(tpl.content, true);
    this.shadowRoot.appendChild(fragment);
    const overlays = Array.from(this.shadowRoot.querySelectorAll('.cc-confirm-overlay')) as HTMLElement[];
    const overlay = overlays[overlays.length - 1];
    if (!overlay) return;
    const cancel = overlay.querySelector('#cc-cancel') as HTMLButtonElement | null;
    const accept = overlay.querySelector('#cc-accept') as HTMLButtonElement | null;
    const cleanup = () => overlay.remove();
    cancel?.addEventListener('click', (ev)=>{ ev.preventDefault(); ev.stopPropagation(); cleanup(); });
    accept?.addEventListener('click', async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      // Cerrar el cuadro inmediatamente para una mejor UX
      cleanup();
      try {
        await apiService.deleteComment(this.state.tipo, parseInt(this.state.idOrOid), String(commentId));
        await this.loadComments();
        const msg = this.shadowRoot?.getElementById('cc-msg');
        if (msg) { msg.textContent = 'Comentario eliminado'; msg.className = 'msg success'; msg.style.display = 'block'; }
      } catch (e){
        const msg = this.shadowRoot?.getElementById('cc-msg');
        if (msg) { msg.textContent = 'Error eliminando comentario'; msg.className = 'msg error'; msg.style.display = 'block'; }
      }
    });
  }
}

customElements.define('comments-root', AppRoot);