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
import '../comment-item/index';

// Inline template
const tplRaw = `<ul class="comments" id="list"></ul>`;

// Inline styles
const cssRaw = `:host { display:block }
.comments { list-style:none; margin:0; padding:0 }`;

type Props = { comments: CommentDoc[]; isAdmin: boolean; username?: string };

export class CommentsList extends HTMLElement {
  private _comments: CommentDoc[] = [];
  private _isAdmin = false;
  private _username: string | undefined;
  set data(p: Props){ this._comments = p.comments; this._isAdmin = p.isAdmin; this._username = p.username; this.render(); }

  connectedCallback(){ this.render(); }

  emit<T>(name: string, detail: T){ this.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true, composed: true })); }

  async render(){
    if (!this.shadowRoot) this.attachShadow({ mode:'open' });
    const html = tplRaw as string;
    const css = cssRaw as string;
    this.shadowRoot!.innerHTML = `<style>${css}</style>` + html;
    const list = this.shadowRoot!.getElementById('list') as HTMLUListElement;
    if (!list) return;
    list.innerHTML = this._comments.map(()=> `<comment-item></comment-item>`).join('');
    const items = Array.from(list.querySelectorAll('comment-item')) as any[];
    items.forEach((item, idx) => {
      const c = this._comments[idx];
      const isOwner = !!this._username && c.usuario === this._username;
      // Editar: SOLO admin. Eliminar: admin o dueño.
      item.data = { comment: c, isAdmin: this._isAdmin, canDelete: this._isAdmin || isOwner, canEdit: this._isAdmin, canReply: true };
    });
    // No re-emit: comment-item already dispatches composed events that bubble to the host
  }
}

customElements.define('comments-list', CommentsList);