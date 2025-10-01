import axios from 'axios';
import type { Tipo, Summary, CommentDoc, ItemDoc, ArmorDoc, WeaponDoc } from '../app-comentarios/types';

const API = axios.create({
  baseURL: 'http://34.16.126.78:1802/api'
});

export function setToken(token?: string) {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete API.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}

export function loadTokenFromStorage() {
  const t = localStorage.getItem('token');
  if (t) setToken(t);
}

export async function login(user: string, pass: string) {
  const res = await API.post('/login', undefined, { headers: { user, pass } });
  setToken(res.data.token);
  return res.data;
}

export async function getSummary(tipo: Tipo, idOrOid: string) {
  const res = await API.get<Summary>(`/comments/${tipo}/${idOrOid}`);
  return res.data;
}

export async function getComments(tipo: Tipo, idOrOid: string, opts?: { orderBy?: 'fecha'|'valoracion'; order?: 'asc'|'desc'; limit?: number; skip?: number; }) {
  const params = new URLSearchParams();
  if (opts?.orderBy) params.set('orderBy', opts.orderBy);
  if (opts?.order) params.set('order', opts.order);
  if (opts?.limit) params.set('limit', String(opts.limit));
  if (opts?.skip) params.set('skip', String(opts.skip));
  const qs = params.toString();
  const res = await API.get<CommentDoc[]>(`/${tipo}/${idOrOid}/comments${qs ? `?${qs}` : ''}`);
  return res.data;
}

export async function createComment(productOid: string, tipo: Tipo, comentario: string, valoracion: number) {
  const body = { comentario, valoracion, referencia: { tipo, id_objeto: productOid } };
  const res = await API.post('/comments', body);
  return res.data;
}

export async function replyComment(tipo: Tipo, idOrOid: string, commentId: string, texto: string) {
  const res = await API.post(`/${tipo}/${idOrOid}/comments/${commentId}/replies`, { comentario: texto });
  return res.data;
}

export async function editComment(tipo: Tipo, idOrOid: string, commentId: string, payload: { comentario?: string; valoracion?: number; }) {
  const res = await API.put(`/${tipo}/${idOrOid}/comments/${commentId}`, payload);
  return res.data;
}

export async function deleteComment(tipo: Tipo, idOrOid: string, commentId: string) {
  const res = await API.delete(`/${tipo}/${idOrOid}/comments/${commentId}?confirm=true`);
  return res.data;
}

export async function getItems(params?: Record<string,string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await API.get<ItemDoc[]>(`/items${qs}`);
  return res.data;
}

export async function getArmors(params?: Record<string,string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await API.get<ArmorDoc[]>(`/armors${qs}`);
  return res.data;
}

export async function getWeapons(params?: Record<string,string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await API.get<WeaponDoc[]>(`/weapons${qs}`);
  return res.data;
}

export function filterByName<T extends { name?: string; nombre?: string }>(arr: T[], name?: string): T[] {
  if (!name) return arr;
  const q = name.trim().toLowerCase();
  return arr.filter(x => (x.name || x.nombre || '').toLowerCase().includes(q));
}