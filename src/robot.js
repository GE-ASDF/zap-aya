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
        if(message.from == "558597284507@c.us"){
            Users.findOne({where: {number: message.from}})
            .then((user)=>{
                if(!user){
                    Users.create(({
                        name: message.sender.pushname,
                        number: message.from,
                    })).then(()=>{
                        stages(client, message)
                    })
                }else{
                    stages(client, message)
                }
            })
          
        }
    })
})


module.exports = {zap,  userStages, atendimentoHumanoAtivo}

