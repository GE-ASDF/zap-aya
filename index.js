const {app, check, validationResult, io} = require("./src/app");
const sendWppMessage = require("./helpers/sendWppMessage");
let enviarMensagemApi = require("./src/server").wppSession;
const HomeController = require("./controllers/home/HomeController");
const ChatController = require("./controllers/chats/ChatController");
const { wppSession } = require("./src/server");
const DDDS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 64, 63, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99];


app.post("/enviar-mensagem", 
[
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