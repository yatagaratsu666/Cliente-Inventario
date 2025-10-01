// Importar y registrar todos los web components
import './web-components/app-root/index';
import './web-components/filter-bar/index';
import './web-components/comments-list/index';
import './web-components/comment-item/index';

// Exportar el componente Angular
export { ComentariosComponent } from './comentarios.component';

// Exportar tipos y servicios para uso externo
export * from './types';
export * from '../services/comentarios.service';