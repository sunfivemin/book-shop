const mariadb = require('mysql2/promise');

const connection = async () => {
  return await mariadb.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'Bookshop',
    dateStrings: true,
  });
};

module.exports = connection;
// const mariadb = require('mysql2/promise');

// const connection = async () => {
//   const conn = await mariadb.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'root',
//     database: 'Bookshop',
//     dateStrings: true,
//   });
//   return conn;
// };

// module.exports = connection;
