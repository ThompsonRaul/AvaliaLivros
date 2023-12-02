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
      res.redirect("/");
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
    A.NomeAutor AS Nome,
    GROUP_CONCAT(L.Titulo SEPARATOR ', ') AS LivrosEscritos
  FROM
    Autores A
  JOIN
    LivrosAutores LA ON A.AutorID = LA.AutorID
  JOIN
    Livros L ON LA.LivroID = L.LivroID
  WHERE
    A.NomeAutor LIKE ?
  GROUP BY
    A.NomeAutor;
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
  
// Rota para processar a atualização
router.post("/update", (req, res) => {
    const { AutorID, NomeAutor } = req.body;
    const query = "UPDATE Autores SET NomeAutor = ? WHERE AutorID = ?";
    db.query(query, [NomeAutor, AutorID], (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Erro ao atualizar o autor.");
      } else {
        // Lógica de redirecionamento ou resposta de sucesso
        res.redirect("/");
      }
    });
  });
  
module.exports = router;
