// entorno producción

export const environment = {
  /** Indica si la aplicación se ejecuta en modo de testeo. */
  production: true,

  apiUrl: 'http://146.148.77.95:1882',

  /** URL base del servicio de batallas. */
  battleUrl: 'http://34.55.196.179:3000',

  battleSocket: 'http://34.55.196.179:3000',

  inventarySocket: 'http://146.148.77.95:1882',

  chatUrlSocket: 'http://34.55.196.179:4000',

    api: { base: 'http://localhost:3000/api' },
  socket: { base: 'http://localhost:3000' }
};