'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/spentMins';
// when this is called does it basically create a new db with the name spentMins? ********
// why is the \\ operator used? ********

exports.TEST_DATABASE_URL = (
  process.env.TEST_DATABASE_URL ||
 'mongodb://localhost/test-spentMins');

exports.PORT = process.env.PORT || 8080;