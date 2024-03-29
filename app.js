const bodyParser = require("body-parser");
const indexRoutes = require("./routes/index");
const livrosRoutes = require("./routes/livros");
const autoresRoutes = require("./routes/autores");
const livrosAutoresRoutes = require("./routes/livros_autores");
const editorasRoutes = require("./routes/editoras");
const generosRoutes = require("./routes/generos");
const livrosEditorasRoutes = require("./routes/livros_editoras");
const livrosGenerosRoutes = require("./routes/livros_generos");
const usuariosRoutes = require("./routes/usuarios");
const avaliacoesRoutes = require("./routes/avaliacoes");
var express = require("express");
var app = express();
// Configuração do EJS como view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", indexRoutes);
app.use("/livros", livrosRoutes);
app.use("/autores", autoresRoutes);
app.use("/livros_autores", livrosAutoresRoutes);
app.use("/editoras", editorasRoutes);
app.use("/generos", generosRoutes);
app.use("/livros_editoras", livrosEditorasRoutes);
app.use("/livros_generos", livrosGenerosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/avaliacoes", avaliacoesRoutes);

app.listen(process.env.DB_PORT, () => {
  console.log(`SERVIDOR ATIVO, ACESSE http://localhost:${process.env.DB_PORT}`);
});
