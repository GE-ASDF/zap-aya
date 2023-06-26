const {io} = require("./app");
const {wppSession} = require("./server");
let {stages, userStages, atendimentoHumanoAtivo} = require("../helpers/stages");
let mensagensRecebidas = []
const connection = require("../core/Model");
const Chats = require("../models/Chats");
const Messages = require("../models/Messages");

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
            if(mensagensRecebidas.length > 0){
                mensagensRecebidas.forEach( mensagemRecebida =>{
                    if(mensagemRecebida.usuario == message.from){
                        mensagemRecebida.mensagens.push(message.body)
                    }
                })
            }else{
                mensagensRecebidas.push({
                    usuario: message.from,
                    mensagens: [message.body]
                })
            }

            Chats.findOne({
                where:{from: message.from}
            }).then((finded) =>{
                if(finded == undefined){
                    Chats.create({
                        from: message.from
                    })
                }
                Chats.findAll({raw:true,order:[['createdAt','DESC']]})
                .then((users)=>{
                    // io.emit("new-message", users);
                    stages(client, message)
                });
            })
        }
        

    })
})


module.exports = {zap,  userStages, atendimentoHumanoAtivo}

