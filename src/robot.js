const {io} = require("./app");
const {wppSession} = require("./server");
let {stages, userStages, atendimentoHumanoAtivo} = require("../helpers/stages");
let mensagensRecebidas = []
const connection = require("../core/Model");

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
        
        console.log(message)
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
            stages(client, message)
          
        }
        

    })
})


module.exports = {zap,  userStages, atendimentoHumanoAtivo}

