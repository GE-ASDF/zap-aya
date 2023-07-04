const {io, app} = require("./app");
const {wppSession} = require("./server");
let {stages, userStages, atendimentoHumanoAtivo} = require("../helpers/stages");
let mensagensRecebidas = []
const connection = require("../core/Model");
const Users = require("../models/Users");


connection
.authenticate()
.then(()=>{
    console.log("Autenticado com sucesso!")
})
.catch((err)=>{
    console.log("Não autenticado", err);
})


let zap = wppSession.then((client)=>{
    io.emit("conectado");
    
    client.onMessage((message)=>{     
        io.sockets.emit('broadcast', message);
        if(mensagensRecebidas.length <= 0){
            let data = {
                from: message.from,
                messages: message.body
            }
            mensagensRecebidas.push(data)
        }else{
            mensagensRecebidas.find((from)=>{
                if(from.from == message.from){
                    from.messages = message.body
                }
            })
        }
        io.emit("showmsg", mensagensRecebidas);
        console.log(message)
        if(message.from == "558597284507@c.us" && !message.isGroupMsg /*|| message.from == "558591116429@c.us" /* &&  message.from !== "558591442725@c.us" && message.from !== "558586307001@c.us" && message.from !== "558591889828" */ /*|| message.from == "558597291722@c.us"*/){
            console.log(message)
            stages(client, message)
        }
          
    })
})



module.exports = {zap,  userStages, mensagensRecebidas, atendimentoHumanoAtivo}

