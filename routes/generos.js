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

module.exports = router;