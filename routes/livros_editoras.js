const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.get("/inserir", (req, res) => {
  const sqlLivros = `
        SELECT * FROM Livros
        `;

  const sqlEditoras = `
        SELECT * FROM Editoras
        `;

  db.query(sqlLivros, (errorLivros, resultsLivros) => {
    if (errorLivros) throw errorLivros;

    db.query(sqlEditoras, (errorEditoras, resultsEditoras) => {
      if (errorEditoras) throw errorEditoras;

      res.render("livros_editoras/inserir", {
        livros: resultsLivros,
        editoras: resultsEditoras,
      });
    });
  });
});

router.post("/post", (req, res) => {
  const { LivroID, EditoraID } = req.body;
  const sql = `
      INSERT INTO 
          LivrosEditoras (LivroID, EditoraID) 
      VALUES 
          (?, ?)`;
  db.query(sql, [LivroID, EditoraID], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao inserir o conjunto livro/editora.");
    } else {
      console.log("Conjunto livro/editora inserido com sucesso!");
      res.redirect("/");
    }
  });
});

module.exports = router;
