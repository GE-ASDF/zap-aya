const {app, check, validationResult, io} = require("./src/app");
const sendWppMessage = require("./helpers/sendWppMessage");
let enviarMensagemApi = require("./src/server").wppSession;
const HomeController = require("./controllers/home/HomeController");
const ChatController = require("./controllers/chats/ChatController");
const { wppSession } = require("./src/server");
const { response } = require("express");
const sendWppImage = require("./helpers/sendImage");
const DDDS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 64, 63, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99];



app.get("/enviar-mensagem",  (req, res)=>{
    enviarMensagemApi.then((client)=>{
        sendWppImage(client ,'558597284507@c.us', 'out.png', 'Esta é uma imagem de teste.')
        .then((response)=>{
            console.log(response);
        })
    })
})


app.post("/enviar-mensagem-api",(req, res)=>{
    const number = req.body.number;
    const message = req.body.message;
    enviarMensagemApi.then((client)=>{
        client.sendText(number, message)
        .then((response)=>{
            if(response){
                response.error = false;
                res.json(response);
            }else{
                response.error = true;
                res.json(response);
            }
        }).catch((response)=>{
            response.error = true;
            res.json(response);
            return;
        })
    })
})

app.get("/responder/:number",[
    check("number").notEmpty().trim().escape(),
], (req, res)=>{
    let number = req.params.number;
    wppSession.then((client)=>{
        client.getChatById(number).then((chat)=>{
            io.emit("chat", chat);
            res.render("pages/responder",{
                chat,
                number,
            });
        })
    })
})


app.use("/", HomeController)
app.use("/admin", ChatController)