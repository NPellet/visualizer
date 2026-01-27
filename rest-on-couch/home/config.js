'use strict';

const origins = process.env.ALLOWED_ORIGINS;
if (origins === '') {
  throw new Error(
    'There must be at least one origin defined in REST_ON_COUCH_ORIGINS',
  );
}
const allowedOrigins = origins.split(',');

let administrators = ['admin@cheminfo.org'];

module.exports = {
  allowedOrigins,
  keys: ['5f8734a3230dc94196e4cd9e158a44a9'],
  administrators,
  superAdministrators: ['admin@cheminfo.org'],
  url: 'http://couchdb:5984',
  username: 'rest-on-couch',
  password: process.env.COUCHDB_PASSWORD,
  adminPassword: process.env.COUCHDB_PASSWORD,
  auth: {
    couchdb: {
      showLogin: true,
    },
  },

  // Default database rights
  // Any logged in user can create documents. Only owners can read and write their own documents.
  rights: {
    read: [],
    write: [],
    create: ['anyuser'],
  },
};
