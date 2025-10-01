export type Tipo = 'armor' | 'item' | 'weapon';

export interface Reply {
  usuario: string;
  comentario: string;
  fecha: string;
}

export interface CommentDoc {
  _id: string;
  usuario: string;
  comentario: string;
  fecha: string;
  valoracion: number;
  imagen?: string | null;
  respuestas?: Reply[];
}

export interface Summary {
  product?: any;
  comments: CommentDoc[];
  stats: { count: number; average: number; distribution: Record<string, number> };
}

export interface ItemDoc {
  id: number;
  name?: string;
  nombre?: string;
  image?: string;
  img?: string;
  [key: string]: any;
}

export interface ArmorDoc {
  id: number;
  name?: string;
  nombre?: string;
  image?: string;
  img?: string;
  [key: string]: any;
}

export interface WeaponDoc {
  id: number;
  name?: string;
  nombre?: string;
  image?: string;
  img?: string;
  [key: string]: any;
}