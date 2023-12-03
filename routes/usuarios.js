const express = require("express");
const router = express.Router();
const db = require("../db.js");
const bcrypt = require("bcrypt");

router.get("/inserir", (req, res) => {
    res.render('usuarios/inserir');
});

// Rota para processar o formulário e inserir no banco de dados
router.post("/post", async (req, res) => {
    const { Nome, Email, Senha } = req.body;

    try {
        // Hash da senha usando bcrypt
        const hashedSenha = await bcrypt.hash(Senha, 10);

        const sql = `
            INSERT INTO 
                Usuarios (Nome, Email, Senha) 
            VALUES 
                (?, ?, ?)`;
        db.query(sql, [Nome, Email, hashedSenha], (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Erro ao inserir o usuário.');
            } else {
                console.log('Usuário inserido com sucesso!');
                res.redirect('/');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar a senha.');
    }
});

module.exports = router;