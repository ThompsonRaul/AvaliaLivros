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

module.exports = router;
