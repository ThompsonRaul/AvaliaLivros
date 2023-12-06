const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.get("/", (req, res) => {
  const livrosPorPagina = 3;
  const paginaAtual = req.query.pagina || 1;

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
    GROUP BY
    ID, Livro, AnoPublicacao, Sinopse
    LIMIT
      ?, ?;
    `;

  // Consulta para obter o número total de livros
  const countQuery = `SELECT COUNT(*) AS totalLivros FROM Livros`;

  // Executar a consulta para obter o total de livros
  db.query(countQuery, (error, countResults) => {
    if (error) throw error;

    const totalLivros = countResults[0].totalLivros;
    const totalPaginas = Math.ceil(totalLivros / livrosPorPagina);

    // Calcular o índice inicial
    const indiceInicial = (paginaAtual - 1) * livrosPorPagina;

    // Executar a consulta com a lógica de paginação
    db.query(query, [indiceInicial, livrosPorPagina], (error, results) => {
      if (error) throw error;

      // Renderizar a página com os resultados e informações de paginação
      res.render("index", {
        livros: results,
        paginaAtual: parseInt(paginaAtual),
        totalPaginas: totalPaginas,
      });
    });
  });
});

module.exports = router;
