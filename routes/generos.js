const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.get("/inserir", (req, res) => {
  res.render("generos/inserir");
});

router.post("/post", (req, res) => {
  const { NomeGenero } = req.body;
  const sql = `
        INSERT INTO 
            Generos (NomeGenero) 
        VALUES 
            (?)`;
  db.query(sql, [NomeGenero], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao inserir o gênero.");
    } else {
      console.log("Gênero inserido com sucesso!");
      res.redirect("/");
    }
  });
});

router.get("/pesquisar", (req, res) => {
  db.query("SELECT * FROM Generos", (error, results) => {
    if (error) {
      console.error("Erro ao obter gêneros:", error);
      res.status(500).send("Erro interno do servidor");
    } else {
      const generos = results;
      res.render("generos/pesquisar", { generos });
    }
  });
});

router.get("/resultados_pesquisa", (req, res) => {
  const { generoId } = req.query;

  // Consulta para obter o nome do gênero
  db.query(
    "SELECT NomeGenero FROM Generos WHERE GeneroID = ?",
    [generoId],
    (error, results) => {
      if (error) {
        console.error("Erro ao obter nome do gênero:", error);
        res.status(500).send("Erro interno do servidor");
      } else {
        const generoNome = results[0].NomeGenero;

        // Consulta para obter livros por gênero
        db.query(
          `SELECT 
          G.GeneroID,
          '${generoNome}' AS NomeGenero,
          GROUP_CONCAT(DISTINCT L.Titulo ORDER BY L.Titulo SEPARATOR ', ') AS TitulosLivros
        FROM Livros L
        JOIN LivrosGeneros LG ON L.LivroID = LG.LivroID
        JOIN Generos G ON LG.GeneroID = G.GeneroID
        WHERE G.GeneroID = ?
        GROUP BY G.GeneroID, '${generoNome}';`,
          [generoId],
          (error, resultadosPesquisa) => {
            if (error) {
              console.error("Erro na pesquisa de livros por gênero:", error);
              res.status(500).send("Erro interno do servidor");
            } else {
              const livrosPorGenero = resultadosPesquisa;
              res.render("generos/resultados_pesquisa", {
                generoNome,
                livrosPorGenero,
              });
            }
          }
        );
      }
    }
  );
});

router.get("/editar/:id", (req, res) => {
  const generoID = req.params.id;
  const query = "SELECT * FROM Generos WHERE GeneroID = ?";

  db.query(query, [generoID], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao buscar o gênero.");
    } else if (results.length > 0) {
      const genero = results[0];
      res.render("generos/editar", { genero });
    } else {
      res.status(404).send("Gênero não encontrado.");
    }
  });
});

router.post("/update", (req, res) => {
  const { GeneroID, NomeGenero } = req.body;
  const query = "UPDATE Generos SET NomeGenero = ? WHERE GeneroID = ?";

  db.query(query, [NomeGenero, GeneroID], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao atualizar o gênero.");
    } else {
      console.log("Gênero atualizado com sucesso!");
      res.redirect(`/generos/resultados_pesquisa?generoId=${GeneroID}`);
    }
  });
});

router.post("/excluir/:id", (req, res) => {
  const GeneroID = req.params.id;

  // Array de instruções SQL
  const queries = [
    "DELETE FROM LivrosGeneros WHERE GeneroID = ?",
    "DELETE FROM Generos WHERE GeneroID = ?",
  ];

  // Loop para executar cada instrução SQL
  queries.forEach((query, index) => {
    db.query(query, [GeneroID], (err) => {
      if (err) {
        console.error(err);
        res.status(500).send(`Erro ao excluir o livro (etapa ${index + 1}).`);
        return;
      }
    });
  });

  console.log("Gênero excluído com sucesso!");
  res.redirect("/generos/pesquisar");
});

module.exports = router;
