const express = require("express")
const router = express.Router();
const Chats = require("../../models/Chats");
const Users = require("../../models/Users");
const {check, validationResult} = require("express-validator");
const {io, app} = require("../../src/app");
const {wppSession} = require("../../src/server");
let {atendimentoHumanoAtivo, userStages } = require("../../src/robot");
const { base64 } = require("base64-img");
const sharp = require("sharp");
const convert = require("../convert");

router.get("/chats", (req, res)=>{
    wppSession.then((client)=>{
        client.listChats({onlyUsers:true})
        .then((chats)=>{
            
            res.render("pages/admin/chats/Index", {chats, error:req.flash("error")});
        })
    })
    // Chats.findAll({
    //     include:[{model: Users}]
    // })
    // .then((chats)=>{
    //     io.emit("ola", chats)
    //     res.render("pages/admin/chats/Index", {chats, error:req.flash("error")});
    // })
})


router.get("/open-chat/:number", (req, res)=>{
    wppSession.then((client)=>{
        let number = req.params.number;
        client.getMessages(number, {count:-1})
        .then((messages)=>{
            client.getProfilePicFromServer(number).then((img)=>{
                messages[0].image = img.img;
                res.render("pages/responder", {messages})
            })
        })
    })
})

router.get("/pegar-contatos", (req, res)=>{
    wppSession.then((client)=>{
        client.getAllContacts()
        .then((contacts)=>{
            res.json(contacts);
            return;
        })
    })
})

router.get('/finalizar-chat/:chat',[
    check('chat').notEmpty().isInt().trim().escape(),
], (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        req.flash("error", 'Não foi possível apagar o registro.')
        res.redirect("/admin/chats");
        return;
    }
    const id = req.params.chat;
    Chats.findOne({where: {id}, include:[{model: Users}]})
    .then((chat)=>{
        if(chat){
            wppSession.then((client)=>{
              client.sendText(chat.user.number, "Atendimento finalizado")
              .then(()=>{
                Chats.update(
                    {finalized:1}, {
                        where:{id: chat.id}
                    }).then(()=>{
                        userStages[chat.user.number] = undefined;
                        atendimentoHumanoAtivo = false;
                    res.redirect("/admin/chats");
                    return;
                })
              })
            })            
        }else{
            res.redirect("/admin/chats")
            return;

        }
    }).catch(()=>{
        res.redirect("/admin/chats")
        return;

    })
  });
  router.get('/finalizar-chat2/:chat',[
    check('chat').notEmpty().trim().escape(),
], (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        req.flash("error", 'Não foi possível apagar o registro.')
        res.redirect("/admin/chats");
        return;
    }
    const number = req.params.chat;
    Users.findOne({where:{number}})
    .then(({id})=>{
        Chats.update({finalized: 1},{where:{userId: id, finalized:0}})
        .then(()=>{
            wppSession.then((client)=>{
                client.sendText(number, "Atendimento finalizado");
                userStages[number] = undefined;
                atendimentoHumanoAtivo = false;
                res.redirect("/admin/chats")
                return;
            }).catch(()=>{
                res.redirect("/admin/chats")
                return;
            })
        }).catch(()=>{
            res.redirect("/admin/chats")
            return;
        })
    }).catch(()=>{
        res.redirect("/admin/chats")
        return;
    })
  });

app.get("/download-image/:source", (req, res)=>{
    let source = req.params.source;
    wppSession.then((client)=>{
        client.downloadMedia(source)
        .then((midia)=>{
            res.json(midia);
            return;
        }).catch((err)=>{
            return err;
        })
    })
})
module.exports = router;