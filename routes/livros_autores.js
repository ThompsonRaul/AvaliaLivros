const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.get("/inserir", (req, res) => {
  const sqlLivros = `
        SELECT * FROM Livros
        `;

  const sqlAutores = `
        SELECT * FROM Autores
        `;

  db.query(sqlLivros, (errorLivros, resultsLivros) => {
    if (errorLivros) throw errorLivros;

    db.query(sqlAutores, (errorAutores, resultsAutores) => {
      if (errorAutores) throw errorAutores;

      // Renderizar a página com os resultados
      res.render("livros_autores/inserir", {
        livros: resultsLivros,
        autores: resultsAutores,
      });
    });
  });
});

// Rota para processar o formulário e inserir no banco de dados
router.post("/post", (req, res) => {
  const { LivroID, AutorID } = req.body;
  const sql = `
      INSERT INTO 
          LivrosAutores (LivroID, AutorID) 
      VALUES 
          (?, ?)`;
  db.query(sql, [LivroID, AutorID], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao inserir o conjunto livro/autor.");
    } else {
      console.log("Conjunto livro/autor inserido com sucesso!");
      res.redirect("/");
    }
  });
});

module.exports = router;
