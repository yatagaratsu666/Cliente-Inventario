// Tipos locales
interface Reply {
  usuario: string;
  comentario: string;
  fecha: string;
}

interface CommentDoc {
  _id: string;
  usuario: string;
  comentario: string;
  fecha: string;
  valoracion: number;
  imagen?: string | null;
  respuestas?: Reply[];
}
// Inline template
const tplRaw = `<li class="card">
  <div class="row">
    <div id="meta"></div>
    <div class="actions">
      <button id="reply">Responder</button>
      <button id="edit" class="admin-only">Editar</button>
      <button id="delete">Eliminar</button>
    </div>
  </div>
  <div id="texto"></div>
  <div id="replies"></div>
</li>`;

// Inline styles
const cssRaw = `:host { display:block }
.card { background:#0d1b2a; border:1px solid #56cfe1; border-radius:8px; padding:10px; color:#eaf6f6 }
.row { display:flex; gap:8px; justify-content:space-between; align-items:center }
.actions { display:flex; gap:6px }
button { background:#56cfe1; color:#0d1b2a; border:2px solid #56cfe1; border-radius:6px; padding:6px 10px; cursor:pointer }
button:hover { background:#48bfe3; border-color:#48bfe3 }
button.secondary { background:transparent; color:#eaf6f6 }
#texto { white-space:pre-wrap; margin-top:8px }
#replies { margin-top:6px; opacity:.9 }
#replies > .reply { border-left: 2px solid #56cfe1; padding-left:8px; margin-top:6px }`;

type Props = { comment: CommentDoc; isAdmin: boolean; canDelete?: boolean; canEdit?: boolean; canReply?: boolean };

export class CommentItem extends HTMLElement {
  props!: Props;
  set data(p: Props){ this.props = p; this.render(); }
  connectedCallback(){ this.render(); }
  emit<T>(name: string, detail: T){ this.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true, composed: true })); }

  async render(){
    if (!this.shadowRoot) this.attachShadow({ mode:'open' });
    if (!this.props) { this.shadowRoot!.innerHTML = ''; return; }
  const { comment, isAdmin, canDelete = false, canEdit = false, canReply = true } = this.props;
  const html = tplRaw as string;
  const css = cssRaw as string;
  this.shadowRoot!.innerHTML = `<style>${css}</style>` + html;

    const meta = this.shadowRoot!.getElementById('meta');
    const texto = this.shadowRoot!.getElementById('texto');
    const replies = this.shadowRoot!.getElementById('replies');

    if (meta) meta.textContent = `${comment.usuario} · ${new Date(comment.fecha).toLocaleString()} · ⭐ ${comment.valoracion}`;
    if (texto) texto.textContent = comment.comentario;
    if (replies) {
      replies.innerHTML = (comment.respuestas||[]).map((r: Reply)=>`<div class="reply"><b>${r.usuario}</b> · ${new Date(r.fecha).toLocaleString()}<br/>${r.comentario}</div>`).join('');
    }
  if (!isAdmin && !canEdit) { (this.shadowRoot!.getElementById('edit') as HTMLElement)?.remove(); }
  if (!canDelete && !isAdmin) { (this.shadowRoot!.getElementById('delete') as HTMLElement)?.remove(); }
  if (!canReply) { (this.shadowRoot!.getElementById('reply') as HTMLElement)?.remove(); }

    this.shadowRoot!.getElementById('reply')?.addEventListener('click', ()=> this.emit('reply', comment._id));
    this.shadowRoot!.getElementById('edit')?.addEventListener('click', ()=> this.emit('edit', comment._id));
    this.shadowRoot!.getElementById('delete')?.addEventListener('click', ()=> this.emit('delete', comment._id));
  }
}

customElements.define('comment-item', CommentItem);