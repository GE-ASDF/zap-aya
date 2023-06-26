const sendWppMessage = require("./sendWppMessage");
const {io} = require("../src/app");
const Chats = require("../models/Chats");
const Messages = require("../models/Messages");
const Users = require("../models/Users");
var userStages = [];
let studentData = false;
let atendimentoHumanoAtivo = false;
let date = new Date().toLocaleDateString("pt-br").split("/").reverse().join("-")
let time = new Date

async function findStudent(studentName){
    let data = new FormData;
    data.append("NomeAluno", studentName);
    let response = await fetch("http://192.168.1.11/api/v1/findbyname.php?filter=prepara&NomeAluno="+studentName, {method:"GET"})
    let student = await response.json();
    
    if(!student){
        let response = await fetch("http://192.168.1.11/api/v1/findbyname.php?filter=ouro&NomeAluno="+studentName, {method:"GET"})
        let student = await response.json();

        if(student){
            return student;
        }else{
            return false;
        }
    }

    return student;
}

const AJUDA = [{},
    {
        resposta(){
            return {
                status: 'TRANSFERIDO',
                message: "Transferimos você para um atendente. Aguarde um pouco...",
            }
        }
    },
    {
        resposta(){
            return {
                status: "FINANCEIRO",
                message: "Para saber mais sobre sua situação financeira você deverá entrar em contato com o setor administrativo. Abaixo o número:",
                contato: {
                    displayName: 'Cleane administrativo',
                    phoneNumber: '558591116429@c.us',
                }
            }
        }
    },
    {
        resposta(){
            return {
                status: "HORARIO",
                message: "Para mudanças de horários é preciso comparecer presencialmente a unidade da Prepara Cursos Carlito Pamplona que fica na Av. Francisco Sá, 4107 - Carlito Pamplona."
            }
        }
    },
    {
        resposta(){
            return{
                status: "CANAIS",
                message: "Nossos canais de atendimento são:\n\n*Telefone fixo: (85) 3236-6006*\n*Sala de aula: (85) 9654-1425*\n*Administrativo: (85) 9111-6429*"
            }
        }
    },
    {
        resposta(){
            return{
                status: "JUSTIFICAR",
                message: "Descreva abaixo *em apenas 1 linha* o motivo da sua falta para que possamos justificá-la no sistema: "
            }
        }
    }
]

async function stages(client, message) {
    let stage = userStages[message.from];

    if(stage == undefined){
        Users.findOne({
            where:{number: message.from}
        }).then((user)=>{
            if(user == undefined){
                Users.create({
                    number:message.from,
                }).then(()=>{
                    let res = sendWppMessage(client, message.from, "Olá! Tudo bem? Eu sou a Aya, atendente virtual da Prepara Cursos. Antes de começarmos escolha uma das opções abaixo: ")
                    res.then(()=>{
                        sendWppMessage(client, message.from, "*Digite 1, se já é aluno*\n*Digite 2, se não é aluno*\n *ESTA É UMA MENSAGEM AUTOMÁTICA NÃO ENVIE ÁUDIOS E NEM IMAGENS.*")
                        userStages[message.from] = "OPCAO";
                    })
                })
            }else{
                let res = sendWppMessage(client, message.from, "Olá! Tudo bem? Eu sou a Aya, atendente virtual da Prepara Cursos. Antes de começarmos escolha uma das opções abaixo: ")
                res.then(()=>{
                    sendWppMessage(client, message.from, "*Digite 1, se já é aluno*\n*Digite 2, se não é aluno*\n *ESTA É UMA MENSAGEM AUTOMÁTICA NÃO ENVIE ÁUDIOS E NEM IMAGENS.*")
                    userStages[message.from] = "OPCAO";
                })
            }
        })
        
    }else{
        let opcao = message.body.split(" ").join(",");
        if(stage == "OPCAO"){
            if(opcao == '1'){
                let res = sendWppMessage(client, message.from, "Que bom que já é nosso aluno. Agora, por favor, digite seu *nome completo*:")
                res.then(()=>{
                    userStages[message.from] = "NOME"
                })
            }else if(opcao == '2'){
                let res =  sendWppMessage(client, message.from, "Que bom tê-lo conosco. Agora, digite seu *nome completo:*")
                res.then(()=>{
                    userStages[message.from] = "NOME"
                })
            }else{
                let res = sendWppMessage(client, message.from, "Desculpe, não entendi, por favor, escolha uma das opções abaixo: ");
                res.then(()=>{
                    sendWppMessage(client, message.from, "*Digite 1, se já é aluno*\n*Digite 2, se não é aluno*")
                    userStages[message.from] = "OPCAO"
                })
            }
        }
        if(stage == 'NOME'){
            let nome = message.body.trim();
            let res = sendWppMessage(client, message.from, `Aguarde um pouco...`);

            res.then(()=>{
                findStudent(nome).then((student)=>{
                    if(student){
                        Users.update({
                            name: message.sender.pushname,
                            isStudent:1,
                        }, {where: {
                            number: message.from,
                            name: null,
                            isStudent:null,
                        }})
                        .then(()=>{
                            let sended = sendWppMessage(client, message.from, `Tudo bem, ${student}! Agora diga-me, digitando o número corresponde a opção, como posso te ajudar: `);
                            sended.then(()=>{
                                sendWppMessage(client, message.from, "1 - DÚVIDA NA AULA\n2 - INFORMAÇÃO FINANCEIRA\n3 - MUDANÇA DE HORÁRIO\n4 - CANAIS DE ATENDIMENTO")
                                userStages[message.from] = "AJUDA"
                            }) 
                        }).catch(()=>{
                            let sended = sendWppMessage(client, message.from, `Tudo bem, ${student}! Agora diga-me, digitando o número corresponde a opção, como posso te ajudar: `);
                            sended.then(()=>{
                                sendWppMessage(client, message.from, "1 - DÚVIDA NA AULA\n2 - INFORMAÇÃO FINANCEIRA\n3 - MUDANÇA DE HORÁRIO\n4 - CANAIS DE ATENDIMENTO")
                                userStages[message.from] = "AJUDA"
                            }) 
                        })
                    }else{
                        let sended = sendWppMessage(client, message.from, "Desculpe, mas infelizmente não encontramos você no nosso banco de dados.");
                        sended.then(()=>{
                            userStages[message.from] = undefined;
                        })
                    }  
                });
                
                });              
        }
        if(stage == "AJUDA"){
            let ajudaNumber = parseInt(message.body);
            if(!isNaN(ajudaNumber)){
                let ajuda = AJUDA[ajudaNumber] ? AJUDA[ajudaNumber].resposta:"";
                let dados = ajuda();
                if(dados.status == "TRANSFERIDO"){
                    Users.findOne({where: {number:message.from}})
                    .then(({id}) =>{
                        if(id){
                            Chats.create({userId: id})
                            .then(()=>{
                                Chats.findAll({raw: true, where:{finalized:0}})
                                .then((users)=>{
                                    io.emit("new-message", users);
                                    console.log("Atendimento automático pausado")
                                    atendimentoHumanoAtivo = true;
                                    sendWppMessage(client, message.from, dados.message);
                                    userStages[message.from] = dados.status;
                                })
                            })
                        }else{
                            Users.create({
                                number:message.from,
                                name:message.sender.pushname
                            }).then(()=>{
                                Users.findOne({where:{number:message.from}})
                                .then(({id})=>{
                                    Chats.create({userId: id})
                                    .then(()=>{
                                        Chats.findAll({raw: true, where:{finalized:0}})
                                        .then((users)=>{
                                            io.emit("new-message", users);
                                            console.log("Atendimento automático pausado")
                                            atendimentoHumanoAtivo = true;
                                            sendWppMessage(client, message.from, dados.message);
                                            userStages[message.from] = dados.status;
                                        })
                                    })
                                })
                            })
                        }
                    })
    
                }else if(dados.status == "FINANCEIRO"){
                    await sendWppMessage(client, message.from, dados.message);
                    await sendContactInfo(client, message.from, dados.contato.phoneNumber, dados.contato.displayName)
                    userStages[message.from] = undefined;
                }else if(dados.status == "HORARIO"){
                    await sendWppMessage(client, message.from, dados.message);
                    userStages[message.from] = undefined;
                }else if(dados.status == "CANAIS"){
                    await sendWppMessage(client, message.from, dados.message);
                    userStages[message.from] = undefined;
                }
            }else{
                await sendWppMessage(client, message.from, "Desculpe, não entendi, por favor, escolha uma das opções abaixo: ");
                await sendWppMessage(client, message.from, "1 - DÚVIDA NA AULA\n2 - INFORMAÇÃO FINANCEIRA\n3 - MUDANÇA DE HORÁRIO\n4 - CANAIS DE ATENDIMENTO")
            }
            
        }          
        if(stage == "TRANSFERIDO"){
            Chats.findOne({
                where:{from: message.from}
            }).then((finded) =>{
                if(finded == undefined){
                    Chats.create({
                        from: message.from
                    })
                }
                Chats.findAll({raw: true})
                .then((users)=>{
                io.emit("new-message", users);
            })
               
            })
            Messages.create({
                from: message.from,
                message: message.body
            })
        }
    }
}

async function sendContactInfo(client, sendTo, contato, name) {
    client.sendContactVcard(sendTo, contato, name)
    .then((res)=>{
        console.log(res)
    }).then((err)=>{
        console.log(err)
    })
}

module.exports = {stages, atendimentoHumanoAtivo, userStages};