// Inline template
const tplRaw = `<section>
  <form id="form" class="form-row" novalidate>
    <div class="field">
      <label for="name">Nombre</label>
      <input id="name" placeholder="Buscar por nombre..." />
    </div>
    <button id="refresh" type="submit">Refrescar</button>
  </form>
  </section>`;

// Inline styles
const cssRaw = `:host { display:block }
/* Container rows */
.row { display:flex; gap:12px }
.form-row { display:flex; gap:12px; align-items:flex-end; flex-wrap:nowrap; width:100% }

/* Field column */
.field { display:flex; flex-direction:column; flex:1 1 auto; min-width:0 }
label { margin-bottom:4px; color:#eaf6f6 }
input { height:32px; padding:6px 8px; border-radius:6px; border:1px solid #56cfe1; background:#0d1b2a; color:#eaf6f6; width:100%; box-sizing:border-box }

/* Button stays to the right without overlapping */
button { height:32px; padding:0 12px; border-radius:6px; border:2px solid #56cfe1; background:#56cfe1; color:#0d1b2a; cursor:pointer; flex:0 0 auto; align-self:flex-end }
button:hover { background:#48bfe3; border-color:#48bfe3 }
button:disabled { opacity:.7; cursor:default }
button:disabled::after { content:' (cargando)'; font-size:.9em }

/* Small screens: allow wrapping and make button full width below */
@media (max-width: 480px) {
  .form-row { flex-wrap:wrap }
  button { width:100% }
}`;

type Props = { name: string; loading: boolean };

export class FilterBar extends HTMLElement {
  props!: Props;
  private _debounce?: number;
  static get observedAttributes(){ return []; }

  set data(p: Props){ this.props = p; this.render(); }

  connectedCallback(){ this.render(); }

  emit<T>(name: string, detail: T){ this.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true, composed: true })); }

  async render(){
    if (!this.shadowRoot) this.attachShadow({ mode:'open' });
    const html = tplRaw as string;
    const css = cssRaw as string;
    this.shadowRoot!.innerHTML = `<style>${css}</style>` + html;
    const { name, loading } = this.props ?? { name:'', loading:false } as Props;
  const nameInput = this.shadowRoot!.getElementById('name') as HTMLInputElement;
  const refreshBtn = this.shadowRoot!.getElementById('refresh') as HTMLButtonElement;
    if (nameInput) nameInput.value = name || '';
    if (refreshBtn) refreshBtn.disabled = !!loading;

    if (nameInput) {
      nameInput.addEventListener('input', (e:any)=>{
        if (this._debounce) window.clearTimeout(this._debounce);
        const val = String(e.target.value);
        this._debounce = window.setTimeout(()=> this.emit('change-name', val), 250);
      });
      const form = this.shadowRoot!.getElementById('form') as HTMLFormElement | null;
      form?.addEventListener('submit', (e)=>{
        e.preventDefault();
        if (this._debounce) window.clearTimeout(this._debounce);
        this.emit('change-name', nameInput.value);
        // Señal visual de loading durante el refresh
        if (refreshBtn) refreshBtn.disabled = true;
        // Rehabilitar el botón cuando el host actualice props.loading
        setTimeout(()=>{ /* noop; boton se habilita en cada render via props */ }, 0);
      });
    }

    refreshBtn?.addEventListener('click', ()=> this.emit('refresh', true));
  }

  focusName(){ const el = this.shadowRoot?.getElementById('name') as HTMLInputElement | null; el?.focus(); if (el) { const v = el.value; el.setSelectionRange(v.length, v.length); } }
}

customElements.define('filter-bar', FilterBar);