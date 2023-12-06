const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.get("/inserir", (req, res) => {
  const sqlLivros = `
        SELECT * FROM Livros
        `;

  const sqlGeneros = `
        SELECT * FROM Generos
        `;

  db.query(sqlLivros, (errorLivros, resultsLivros) => {
    if (errorLivros) throw errorLivros;

    db.query(sqlGeneros, (errorGeneros, resultsGeneros) => {
      if (errorGeneros) throw errorGeneros;

      res.render("livros_generos/inserir", {
        livros: resultsLivros,
        generos: resultsGeneros,
      });
    });
  });
});

router.post("/post", (req, res) => {
  const { LivroID, GeneroID } = req.body;
  const sql = `
      INSERT INTO 
          LivrosGeneros (LivroID, GeneroID) 
      VALUES 
          (?, ?)`;
  db.query(sql, [LivroID, GeneroID], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao inserir o conjunto livro/gênero.");
    } else {
      console.log("Conjunto livro/gênero inserido com sucesso!");
      res.redirect("/");
    }
  });
});

module.exports = router;
