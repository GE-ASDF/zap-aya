const sendWppMessage = require("./sendWppMessage");
const {io} = require("../src/app");
const Chats = require("../models/Chats");
const Messages = require("../models/Messages");
const Users = require("../models/Users");
var userStages = [];
let studentData = false;
let atendimentoHumanoAtivo = false;
let date = new Date().toLocaleDateString("pt-br").split("/").reverse().join("-")
let time = new Date().toLocaleTimeString("pt-br")
let dateComplete = `${date} ${time}`;
let opcao = ''

async function findStudent(studentName){
    let data = new FormData;
    data.append("NomeAluno", studentName);
    let response = await fetch("http://pc-1/api/v1/findbyname.php?filter=prepara&NomeAluno="+studentName, {method:"GET"})
    let student = await response.json();
    
    if(!student){
        let response = await fetch("http://pc-1/api/v1/findbyname.php?filter=ouro&NomeAluno="+studentName, {method:"GET"})
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
]

async function stages(client, message) {
    let stage = userStages[message.from];
    
    if(stage == undefined){
        sendWppMessage(client, message.from, "Olá! Tudo bem? Eu sou a Aya, atendente virtual da Prepara Cursos. Antes de começarmos escolha uma das opções abaixo: ")
        .then(()=>{
            sendWppMessage(client, message.from, "*Digite 1, se já é aluno*\n*Digite 2, se não é aluno*\n *ESTA É UMA MENSAGEM AUTOMÁTICA NÃO ENVIE ÁUDIOS E NEM IMAGENS.*")
            .then(()=>{
                userStages[message.from] = "OPCAO";
            })
        })
    }else{

    if(stage == "OPCAO"){
            opcao = message.body.trim().parseInt();
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
        if(stage == "NOME"){
            let nome = message.body.trim();
            sendWppMessage(client, message.from, "Aguarde um pouco...")
            .then(()=>{
                if(opcao == "1"){
                    findStudent(nome)
                    .then((student)=>{
                        if(student){
                            sendWppMessage(client, message.from, `Tudo bem, ${student}! Agora diga-me, digitando o número corresponde a opção de como posso te ajudar: `)
                            .then(()=>{
                                sendWppMessage(client, message.from, "1 - DÚVIDA NA AULA\n2 - INFORMAÇÃO FINANCEIRA\n3 - MUDANÇA DE HORÁRIO\n4 - CANAIS DE ATENDIMENTO")
                                userStages[message.from] = "AJUDA"
                            })
                        }
                    })
                }else if(opcao == "2"){
                    sendWppMessage(client, message.from, `Tudo bem, ${nome}! Agora diga-me, digitando o número corresponde a opção de como posso te ajudar: `)
                    .then(()=>{
                        sendWppMessage(client, message.from, "1 - DÚVIDA NA AULA\n2 - INFORMAÇÃO FINANCEIRA\n3 - MUDANÇA DE HORÁRIO\n4 - CANAIS DE ATENDIMENTO")
                        userStages[message.from] = "AJUDA"
                    })
                }else{
                    sendWppMessage(client, message.from, `Desculpe, mas eu não entendi. Por favor, escolha uma das opções abaixo:`)
                    .then(()=>{
                        sendWppMessage(client, message.from, "1 - DÚVIDA NA AULA\n2 - INFORMAÇÃO FINANCEIRA\n3 - MUDANÇA DE HORÁRIO\n4 - CANAIS DE ATENDIMENTO")
                        userStages[message.from] = "OPCAO"
                    })
                }
            })
        }
        if(stage == "AJUDA"){
            let ajudaNumber = parseInt(message.body);
            if(!isNaN(ajudaNumber)){
                let ajuda = AJUDA[ajudaNumber] ? AJUDA[ajudaNumber].resposta:"";
                if(!ajuda){
                    let res = sendWppMessage(client, message.from, "Desculpe, não entendi, por favor, escolha uma das opções abaixo: ");
                    res.then(()=>{
                        sendWppMessage(client, message.from, "1 - DÚVIDA NA AULA\n2 - INFORMAÇÃO FINANCEIRA\n3 - MUDANÇA DE HORÁRIO\n4 - CANAIS DE ATENDIMENTO")
                    })
                    
                }
                let dados = ajuda();
                if(dados.status == "TRANSFERIDO"){
                    // REFAZER A LÓGICA
                    Users.findOne({raw: true, where: {number: message.from}})
                    .then((user)=>{
                        if(user){
                            Chats.create({
                                userId: user.id,
                                createdAt: dateComplete,
                                updateAt:dateComplete,
                            }).then(()=>{
                                Chats.findAll({raw:true, where:{finalized: 0}})
                                .then((chats)=>{
                                    io.emit("new-message", chats);
                                    console.log("Atendimento automático pausado")
                                    atendimentoHumanoAtivo = true;
                                    sendWppMessage(client, message.from, dados.message);
                                    userStages[message.from] = dados.status;
                                })
                            })
                        }else{
                            Users.create({name:message.sender.pushname, number:message.from})
                            .then(()=>{
                                Users.findOne({where: {number:message.from}})
                                .then((user)=>{
                                    Chats.create({userId: user.id})
                                    .then(()=>{
                                        Chats.findAll({where: {finalized:0}})
                                        .then((chats)=>{
                                            io.emit("new-message", chats);
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
                    sendWppMessage(client, message.from, dados.message);
                    sendContactInfo(client, message.from, dados.contato.phoneNumber, dados.contato.displayName)
                    userStages[message.from] = undefined;
                }else if(dados.status == "HORARIO"){
                    sendWppMessage(client, message.from, dados.message);
                    userStages[message.from] = undefined;
                }else if(dados.status == "CANAIS"){
                    sendWppMessage(client, message.from, dados.message);
                    userStages[message.from] = undefined;
                }
            }else{
                sendWppMessage(client, message.from, "Desculpe, não entendi, por favor, escolha uma das opções abaixo: ");
                sendWppMessage(client, message.from, "1 - DÚVIDA NA AULA\n2 - INFORMAÇÃO FINANCEIRA\n3 - MUDANÇA DE HORÁRIO\n4 - CANAIS DE ATENDIMENTO")
            }
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

module.exports = {stages, atendimentoHumanoAtivo, userStages}