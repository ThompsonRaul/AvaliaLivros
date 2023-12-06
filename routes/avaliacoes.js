const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.get("/inserir", (req, res) => {
  const sqlLivros = `
      SELECT * FROM Livros
    `;

  const sqlUsuarios = `
      SELECT * FROM Usuarios
    `;

  db.query(sqlLivros, (errorLivros, resultsLivros) => {
    if (errorLivros) throw errorLivros;

    db.query(sqlUsuarios, (errorUsuarios, resultsUsuarios) => {
      if (errorUsuarios) throw errorUsuarios;

      res.render("avaliacoes/inserir", {
        livros: resultsLivros,
        usuarios: resultsUsuarios,
      });
    });
  });
});

router.post("/post", (req, res) => {
  const { LivroID, UsuarioID, Nota, Comentario } = req.body;
  const sql = `
      INSERT INTO 
          Avaliacoes (LivroID, UsuarioID, Nota, Comentario) 
      VALUES 
          (?, ?, ?, ?)`;

  db.query(sql, [LivroID, UsuarioID, Nota, Comentario], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao inserir a avaliação.");
    } else {
      console.log("Avaliação inserida com sucesso!");
      res.redirect("/");
    }
  });
});

router.get("/pesquisar", (req, res) => {
  db.query("SELECT * FROM Livros", (error, results) => {
    if (error) {
      console.error("Erro ao obter livros:", error);
      res.status(500).send("Erro interno do servidor");
    } else {
      const livros = results;
      res.render("avaliacoes/pesquisar", { livros });
    }
  });
});

router.get("/resultados_pesquisa", (req, res) => {
  const { livroId } = req.query;

  db.query(
    "SELECT Titulo FROM Livros WHERE LivroID = ?",
    [livroId],
    (error, results) => {
      if (error) {
        console.error("Erro ao obter título do livro:", error);
        res.status(500).send("Erro interno do servidor");
      } else {
        const livroTitulo = results[0].Titulo;

        db.query(
          `SELECT 
          A.AvaliacaoID,
          U.Nome AS NomeUsuario,
          A.Nota,
          A.Comentario,
          DATE_FORMAT(A.DataAvaliacao, '%d/%m/%Y') AS DataAvaliacao
      FROM Avaliacoes A
      JOIN Usuarios U ON A.UsuarioID = U.UsuarioID
      WHERE A.LivroID = ?;
      `,
          [livroId],
          (error, resultadosPesquisa) => {
            if (error) {
              console.error("Erro na pesquisa de avaliações por livro:", error);
              res.status(500).send("Erro interno do servidor");
            } else {
              const avaliacoesPorLivro = resultadosPesquisa;
              res.render("avaliacoes/resultados_pesquisa", {
                livroTitulo,
                avaliacoesPorLivro,
              });
            }
          }
        );
      }
    }
  );
});

router.get("/editar/:id", (req, res) => {
  const avaliacaoID = req.params.id;
  const query = "SELECT * FROM Avaliacoes WHERE AvaliacaoID = ?";

  db.query(query, [avaliacaoID], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao buscar a avaliação.");
    } else if (results.length > 0) {
      const avaliacao = results[0];
      res.render("avaliacoes/editar", { avaliacao });
    } else {
      res.status(404).send("Avaliação não encontrada.");
    }
  });
});

router.post("/update", (req, res) => {
  const { AvaliacaoID, Nota, Comentario } = req.body;
  const query =
    "UPDATE Avaliacoes SET Nota = ?, Comentario = ? WHERE AvaliacaoID = ?";

  db.query(query, [Nota, Comentario, AvaliacaoID], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao atualizar a avaliação.");
    } else {
      console.log("Avaliação atualizada com sucesso!");
      res.redirect("/avaliacoes/pesquisar");
    }
  });
});

router.post("/excluir/:id", (req, res) => {
  const avaliacaoID = req.params.id;
  const query = "DELETE FROM Avaliacoes WHERE AvaliacaoID = ?";

  db.query(query, [avaliacaoID], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao excluir a avaliação.");
    } else {
      console.log("Avaliação excluída com sucesso!");
      res.redirect("/avaliacoes/pesquisar");
    }
  });
});

module.exports = router;
