const {app, body, check, validationResult, upload, io} = require("./src/app");
const sendWppMessage = require("./helpers/sendWppMessage");
const { json } = require("body-parser");
let { zap, users, atendimentoHumanoAtivo, userStages } = require("./src/robot");
let wppSessionFinalizar = require("./src/server");
let enviarMensagemApi = require("./src/server").wppSession;
const Chats = require("./models/Chats");

const DDDS = [11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 24, 27, 28, 31, 32, 33, 34,
    35, 37, 38, 41, 42, 43, 44, 45, 46,
    47, 48, 49, 51, 53, 54, 55, 61, 62,
    64, 63, 65, 66, 67, 68, 69, 71, 73,
    74, 75, 77, 79, 81, 82, 83, 84, 85,
    86, 87, 88, 89, 91, 92, 93, 94, 95,
    96, 97, 98, 99]

app.post("/enviar-mensagem", [
    check('number').notEmpty().isLength({min: 10, max:11}).trim().escape().withMessage("O campo é obrigatório e deve conter 10 caracteres no mínimo 11 no máximo."),
    check('message').notEmpty().isLength({min: 1}).trim().escape().withMessage("O campo é obrigatório e deve conter 1 caractere no mínimo."),

], (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        errors.errors.forEach((erro)=>{
            req.flash(erro.path, erro.msg)
        })
        res.redirect("/");
        return;
    }
    
    let number = req.body.number;
    number = number.replace(/\D/g, '');

    if(number.indexOf("@c.us") == -1){
        number = number + "@c.us";
    }


    if(DDDS.indexOf(parseInt(number.substring(0, 2))) == -1){
        req.flash("number", "O DDD informado não é valido.")
        res.redirect("/");
        return;
    }

    if(number.substring(0, 2) != 55){
        number = "55" + number;
    }

    let message = req.body.message;

    enviarMensagemApi.then((client)=>{
        let response = sendWppMessage(client, number, message);

        if(response){
            req.flash("success", "A mensagem foi enviada com sucesso");
            res.json({
                error: false,
            });
            return;
            // res.redirect("/");
        }else{
            req.flash("error", "A mensagem não foi enviada");
            res.redirect("/");
        }
    })
})

app.post("/enviar-mensagem-api", (req, res)=>{

    let number = req.body.number;
    number = number.replace(/\D/g, '');

    if(number.indexOf("@c.us") == -1){
        number = number + "@c.us";
    }

    if(DDDS.indexOf(parseInt(number.substring(0, 2))) == -1){
        res.json({
            error:true,
            message: 'O DDD informado não é válido.'
        })

        return;
    }

    if(number.substring(0, 2) != 55){
        number = "55" + number;
    }

    let message = req.body.message;

    enviarMensagemApi.then((client)=>{
        let response = sendWppMessage(client, number, message);

        if(response){
            req.flash("success", "A mensagem foi enviada com sucesso");
            res.json({
                error: false,
            });
            return;
            // res.redirect("/");
        }else{
            res.json({
                error:true,
            })
            return;
        }
    })
})

app.get("/responder/:number",[
    check("number").notEmpty().trim().escape(),
], (req, res)=>{
    let number = req.params.number;
    res.render("pages/responder",{
        number,
    });
})

app.get('/finalizar-chat/:user', (req, res) => {
    const { user } = req.params;

    // Verifica se o usuário existe na lista de usuários
    Chats.findOne({
        where:{from: user}
    }).then((user)=>{
        if(user.from != undefined){
            wppSessionFinalizar.wppSession.then(client=>{
                client.sendText(user.from, "Atendimento finalizado");
            })
             
            Chats.destroy({
                where:{from: user.from}
            }).then(()=>{
                Chats.findAll({raw: true})
                .then((users)=>{
                    io.emit('new-message', users);
                    atendimentoHumanoAtivo = false;
                    userStages[user.from] = undefined;
                    res.redirect("/")
                }).catch((err)=>{
                    console.log(err)
                    res.redirect("/")
                })

            }).catch((err)=>{
                console.log(err)
                res.redirect("/")
            })
            
        }else{
            res.redirect("/");
        }
    })  

  });


app.get("/", (req, res)=>{
        res.render("index", {
            success: req.flash("success"),
            error: req.flash("error"),
            number: req.flash("number"),
            message: req.flash("message"),
        });
})