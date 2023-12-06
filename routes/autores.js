const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.get("/inserir", (req, res) => {
  res.render("autores/inserir");
});

router.post("/post", (req, res) => {
  const { NomeAutor } = req.body;
  const sql = `
        INSERT INTO 
            Autores (NomeAutor) 
        VALUES 
            (?)`;
  db.query(sql, [NomeAutor], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao inserir o autor.");
    } else {
      console.log("Autor inserido com sucesso!");
      res.redirect("/autores/resultados_pesquisa?nome=");
    }
  });
});

router.get("/pesquisar", (req, res) => {
  res.render("autores/pesquisar");
});

router.get("/resultados_pesquisa", (req, res) => {
  let searchTerm = req.query.nome || "";
  searchTerm = "%" + searchTerm + "%";

  const query = `
    SELECT
        Autores.AutorID,
        Autores.NomeAutor,
        GROUP_CONCAT(DISTINCT Livros.Titulo ORDER BY Livros.Titulo ASC SEPARATOR ', ') AS Livros
    FROM Autores
    LEFT JOIN LivrosAutores ON Autores.AutorID = LivrosAutores.AutorID
    LEFT JOIN Livros ON LivrosAutores.LivroID = Livros.LivroID
    WHERE Autores.NomeAutor LIKE ?
    GROUP BY Autores.AutorID;

`;

  db.query(query, [searchTerm], (error, autores) => {
    if (error) {
      console.error("Erro:", error);
      res.status(500).send("Erro interno do servidor");
    } else {
      res.render("autores/resultados_pesquisa", { autores, searchTerm });
    }
  });
});

router.get("/editar/:id", (req, res) => {
  const autorID = req.params.id;
  const query = "SELECT * FROM Autores WHERE AutorID = ?";
  db.query(query, [autorID], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao buscar o autor.");
    } else if (results.length > 0) {
      const autor = results[0];
      res.render("autores/editar", { autor });
    } else {
      res.status(404).send("Autor não encontrado.");
    }
  });
});

router.post("/update", (req, res) => {
  const { AutorID, NomeAutor } = req.body;
  const query = "UPDATE Autores SET NomeAutor = ? WHERE AutorID = ?";
  db.query(query, [NomeAutor, AutorID], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao atualizar o autor.");
    } else {
      res.redirect("/autores/resultados_pesquisa?nome=");
    }
  });
});

router.post("/excluir/:id", (req, res) => {
  const autorID = req.params.id;

  const queries = [
    "DELETE FROM LivrosAutores WHERE AutorID = ?",
    "DELETE FROM Autores WHERE AutorID = ?",
  ];

  queries.forEach((query, index) => {
    db.query(query, [autorID], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send(`Erro ao excluir o livro (etapa ${index + 1}).`);
        return;
      }
    });
  });

  console.log("Autor excluído com sucesso!");
  res.redirect("/autores/resultados_pesquisa?nome=");
});

module.exports = router;
