const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.get("/inserir", (req, res) => {
  res.render("livros/inserir");
});

// Rota para processar o formulário e inserir no banco de dados
router.post("/post", (req, res) => {
  const { Titulo, AnoPublicacao, NumPaginas, Sinopse } = req.body;
  const sql = `
      INSERT INTO 
          Livros (Titulo, AnoPublicacao, NumPaginas, Sinopse) 
      VALUES 
          (?, ?, ?, ?)`;
  db.query(sql, [Titulo, AnoPublicacao, NumPaginas, Sinopse], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao inserir o livro.");
    } else {
      console.log("Livro inserido com sucesso!");
      res.redirect("/");
    }
  });
});

router.get("/pesquisar", (req, res) => {
  let searchTerm = req.query.nome || "";
  searchTerm = "%" + searchTerm + "%";

  const query = `
    SELECT
      Livros.LivroID AS ID,
      Livros.Titulo AS Livro,
      Livros.AnoPublicacao AS Ano,
      Livros.NumPaginas AS Paginas,
      Livros.Sinopse AS Sinopse,
      GROUP_CONCAT(DISTINCT Autores.NomeAutor SEPARATOR ', ') AS Autores,
      GROUP_CONCAT(DISTINCT Editoras.NomeEditora SEPARATOR ', ') AS Editoras,
      GROUP_CONCAT(DISTINCT Generos.NomeGenero SEPARATOR ', ') AS Generos,
      ROUND(AVG(Avaliacoes.Nota), 1) AS MediaAvaliacao
    FROM
      Livros
    LEFT JOIN
      LivrosAutores ON Livros.LivroID = LivrosAutores.LivroID
    LEFT JOIN
      Autores ON LivrosAutores.AutorID = Autores.AutorID
    LEFT JOIN
      LivrosEditoras ON Livros.LivroID = LivrosEditoras.LivroID
    LEFT JOIN
      Editoras ON LivrosEditoras.EditoraID = Editoras.EditoraID
    LEFT JOIN
      LivrosGeneros ON Livros.LivroID = LivrosGeneros.LivroID
    LEFT JOIN
      Generos ON LivrosGeneros.GeneroID = Generos.GeneroID
    LEFT JOIN
      Avaliacoes ON Livros.LivroID = Avaliacoes.LivroID
      WHERE
        Livros.Titulo LIKE ?
    GROUP BY
    ID, Livro, AnoPublicacao, Sinopse
    `;

  db.query(query, [searchTerm], (error, livros) => {
    if (error) {
      console.error("Erro:", error);
      res.status(500).send("Erro interno do servidor");
    } else {
      res.render("livros/pesquisar", { livros, searchTerm });
    }
  });
});

// Rota para exibir o formulário de atualização
router.get("/editar/:id", (req, res) => {
  const livroID = req.params.id;
  const query = "SELECT * FROM Livros WHERE LivroID = ?";
  db.query(query, [livroID], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao buscar o livro.");
    } else if (results.length > 0) {
      const livro = results[0];
      res.render("livros/editar", { livro });
    } else {
      res.status(404).send("Livro não encontrado.");
    }
  });
});

// Rota para processar a atualização
router.post("/update", (req, res) => {
  const { LivroID, Titulo, AnoPublicacao, NumPaginas, Sinopse } = req.body;
  const query =
    "UPDATE Livros SET Titulo = ?, AnoPublicacao = ?, NumPaginas = ?, Sinopse = ? WHERE LivroID = ?";
  db.query(
    query,
    [Titulo, AnoPublicacao, NumPaginas, Sinopse, LivroID],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Erro ao atualizar o livro.");
      } else {
        console.log("Livro atualizado com sucesso!");
        return;
      }
    }
  );
});

router.post("/excluir/:id", (req, res) => {
  const livroID = req.params.id;

  // Array de instruções SQL
  const queries = [
    "DELETE FROM Avaliacoes WHERE LivroID = ?",
    "DELETE FROM LivrosAutores WHERE LivroID = ?",
    "DELETE FROM LivrosEditoras WHERE LivroID = ?",
    "DELETE FROM LivrosGeneros WHERE LivroID = ?",
    "DELETE FROM Livros WHERE LivroID = ?",
  ];

  // Loop para executar cada instrução SQL
  queries.forEach((query, index) => {
    db.query(query, [livroID], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send(`Erro ao excluir o livro (etapa ${index + 1}).`);
        return;
      }
    });
  });

  console.log("Livro excluído com sucesso!");
  res.redirect("/"); // Redireciona para a página principal após excluir o livro
});

module.exports = router;
