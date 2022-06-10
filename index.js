const express = require("express");
const app = express();
const favicon = require('serve-favicon');
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.ico"))

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => {
    console.log("Listening on 3000")
});