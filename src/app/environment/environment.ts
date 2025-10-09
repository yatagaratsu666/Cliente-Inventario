export const environment = {
  /** Indica si la aplicación se ejecuta en modo de testeo. */
  production: false,

  /** URL base de la API utilizada en testeo. */
  apiUrl: 'http://136.112.163.5:1882', /* 'http://localhost:1882',*/

  /** URL base del servicio de batallas. */
  battleUrl: 'http://35.223.34.220:3000', //'http://34.57.149.206:3000',

  battleSocket: 'http://35.223.34.220:3000',

  inventarySocket: 'http://136.112.163.5:1882/',  /*'http://localhost:1882',*/

  chatUrlSocket: 'http://34.44.126.114:4000',

  api: { base: 'https://auction-deploy-272361825762.us-east1.run.app/api' },
  socket: { base: 'https://auction-deploy-272361825762.us-east1.run.app' },

  missionsApiBaseUrl: 'https://nexus-295839446356.us-central1.run.app:4001',    
  missionsSseBaseUrl: 'https://nexus-295839446356.us-central1.run.app:4001',

  usersUrl: 'https://thenexusbattles-771648021041.southamerica-east1.run.app'

};
