const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.get("/inserir", (req, res) => {
  res.render("editoras/inserir");
});

router.post("/post", (req, res) => {
  const { NomeEditora } = req.body;
  const sql = `
        INSERT INTO 
            Editoras (NomeEditora) 
        VALUES 
            (?)`;
  db.query(sql, [NomeEditora], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao inserir a editora.");
    } else {
      console.log("Editora inserida com sucesso!");
      res.redirect("/");
    }
  });
});

router.get("/pesquisar", (req, res) => {
  res.render("editoras/pesquisar");
});

router.get("/resultados_pesquisa", (req, res) => {
  let searchTerm = req.query.nome || "";
  searchTerm = "%" + searchTerm + "%";

  const query = `
  SELECT
  Editoras.EditoraID,
  Editoras.NomeEditora,
  GROUP_CONCAT(Livros.Titulo ORDER BY Livros.Titulo) AS Livros
FROM
  Livros
  JOIN LivrosEditoras ON Livros.LivroID = LivrosEditoras.LivroID
  JOIN Editoras ON LivrosEditoras.EditoraID = Editoras.EditoraID
GROUP BY
  Editoras.EditoraID, Editoras.NomeEditora;

  
  `;

  db.query(query, [searchTerm], (error, editoras) => {
    if (error) {
      console.error("Erro:", error);
      res.status(500).send("Erro interno do servidor");
    } else {
      res.render("editoras/resultados_pesquisa", { editoras, searchTerm });
    }
  });
});

router.get("/editar/:id", (req, res) => {
  const editoraID = req.params.id;
  const query = "SELECT * FROM Editoras WHERE EditoraID = ?";

  db.query(query, [editoraID], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao buscar a editora.");
    } else if (results.length > 0) {
      const editora = results[0];
      res.render("editoras/editar", { editora });
    } else {
      res.status(404).send("Editora não encontrada.");
    }
  });
});

router.post("/update", (req, res) => {
  const { EditoraID, NomeEditora } = req.body;
  const query = "UPDATE Editoras SET NomeEditora = ? WHERE EditoraID = ?";

  db.query(query, [NomeEditora, EditoraID], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao atualizar a editora.");
    } else {
      res.redirect("/editoras/resultados_pesquisa?nome=");
    }
  });
});

router.post("/excluir/:id", (req, res) => {
  const editoraID = req.params.id;

  const queries = [
    "DELETE FROM LivrosEditoras WHERE EditoraID = ?",
    "DELETE FROM Editoras WHERE EditoraID = ?",
  ];

  queries.forEach((query, index) => {
    db.query(query, [editoraID], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send(`Erro ao excluir o livro (etapa ${index + 1}).`);
        return;
      }
    });
  });

  console.log("Editora excluída com sucesso!");
  res.redirect("/editoras/resultados_pesquisa?nome=");
});

module.exports = router;
