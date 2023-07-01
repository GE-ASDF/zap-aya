const {io} = require("./app");
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

        if(message.from == "558597284507@c.us"){
            stages(client, message)
        }
          
    })
})


module.exports = {zap,  userStages, mensagensRecebidas, atendimentoHumanoAtivo}

