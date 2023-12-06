const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.get("/inserir", (req, res) => {
  res.render("usuarios/inserir");
});

router.post("/post", (req, res) => {
  const { Nome, Email, Senha } = req.body;
  const sql = `
      INSERT INTO 
        Usuarios (Nome, Email, Senha) 
      VALUES 
        (?, ?, ?)`;

  db.query(sql, [Nome, Email, Senha], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao inserir o usuário.");
    } else {
      console.log("Usuário inserido com sucesso!");
      res.redirect("/usuarios/resultados_pesquisa?nome=");
    }
  });
});

router.get("/pesquisar", (req, res) => {
  res.render("usuarios/pesquisar");
});

router.get("/resultados_pesquisa", (req, res) => {
  let searchTerm = req.query.nome || "";
  searchTerm = "%" + searchTerm + "%";

  const query = `
  SELECT
  U.UsuarioID,
  U.Nome,
  U.Email,
  GROUP_CONCAT(DISTINCT L.Titulo ORDER BY L.Titulo ASC SEPARATOR ', ') AS FilmesAvaliados
FROM Usuarios U
LEFT JOIN Avaliacoes A ON U.UsuarioID = A.UsuarioID
LEFT JOIN Livros L ON A.LivroID = L.LivroID
WHERE U.Nome LIKE "%%"
GROUP BY U.UsuarioID;

  `;

  db.query(query, [searchTerm, searchTerm], (error, usuarios) => {
    if (error) {
      console.error("Erro:", error);
      res.status(500).send("Erro interno do servidor");
    } else {
      res.render("usuarios/resultados_pesquisa", { usuarios, searchTerm });
    }
  });
});

router.get("/editar/:id", (req, res) => {
  const usuarioID = req.params.id;
  const query = "SELECT * FROM Usuarios WHERE UsuarioID = ?";
  db.query(query, [usuarioID], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao buscar o usuário.");
    } else if (results.length > 0) {
      const usuario = results[0];
      res.render("usuarios/editar", { usuario });
    } else {
      res.status(404).send("Usuário não encontrado.");
    }
  });
});

router.post("/update", (req, res) => {
  const { UsuarioID, Nome, Email } = req.body;
  const query = "UPDATE Usuarios SET Nome = ?, Email = ? WHERE UsuarioID = ?";

  db.query(query, [Nome, Email, UsuarioID], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Erro ao atualizar o usuário.");
    } else {
      res.redirect("/usuarios/resultados_pesquisa?nome=");
    }
  });
});

router.post("/excluir/:id", (req, res) => {
  const usuarioID = req.params.id;

  const queries = [
    "DELETE FROM Avaliacoes WHERE UsuarioID = ?",
    "DELETE FROM Usuarios WHERE UsuarioID = ?",
  ];

  queries.forEach((query, index) => {
    db.query(query, [usuarioID], (err) => {
      if (err) {
        console.error(err);
        res.status(500).send(`Erro ao excluir o usuário (etapa ${index + 1}).`);
        return;
      }
    });
  });

  console.log("Usuário excluído com sucesso!");
  res.redirect("/usuarios/resultados_pesquisa?nome=");
});

module.exports = router;
