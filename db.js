require("dotenv").config();

var mysql = require("mysql2");
// elementos para conexao com mysql
var conexao = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});
//executar conexao com BD
conexao.connect();
module.exports = conexao;
