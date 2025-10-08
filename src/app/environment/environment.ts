export const environment = {
  /** Indica si la aplicación se ejecuta en modo de testeo. */
  production: false,

  /** URL base de la API utilizada en testeo. */
  apiUrl: 'http://136.112.163.5:1882', /* 'http://localhost:1882',*/

  /** URL base del servicio de batallas. */
  battleUrl: 'http://localhost:3000', //'http://34.57.149.206:3000',

  battleSocket: 'http://localhost:3000',

  inventarySocket: 'http://136.112.163.5:1882/',  /*'http://localhost:1882',*/

  chatUrlSocket: 'http://34.44.126.114:4000',

  api: { base: 'https://auction-deploy-272361825762.us-east1.run.app/api' },
  socket: { base: 'https://auction-deploy-272361825762.us-east1.run.app' },

  missionsApiBaseUrl: 'http://localhost:4001',    
  missionsSseBaseUrl: 'http://localhost:4001',

  usersUrl: 'https://thenexusbattles-771648021041.southamerica-east1.run.app'

};
