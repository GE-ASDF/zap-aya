require("dotenv").config();
const fs = require("fs");
const express = require("express");
const body = require("body-parser");
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const {check, validationResult} = require("express-validator");
var fileupload = require("express-fileupload");
const multer = require('multer');
const Chats = require("../models/Chats");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.ogirinalname)
  }
})
const http = require("http").createServer(app);
const io = require("socket.io")(http)
const port = 3000;
const upload = multer({ storage })
app.use(fileupload());

app.use(session({
    secret:'flashblog',
    saveUninitialized: true,
    resave: true
}));

app.use(flash())
app.use(express.static("public"));
app.use(body.urlencoded({extended: false}));
app.use(body.json());

app.set("view engine", "ejs");

io.on('connection', (socket)=>{
  console.log("Novo cliente conectado");
  Chats.findAll({where:{finalized:0}})
  .then((chats)=>{
    socket.emit('new-message', chats);
  })
  socket.on('disconnect', ()=>{
      console.log("Cliente desconectado");
  })
})

http.listen(port, (err)=>{
  if(err != null){
    console.log("O servidor não está rodando.")
  }else{
      console.log("O servidor está rodando.");
  }
})

module.exports = {app,fs, body, io, http, check, validationResult, upload}

