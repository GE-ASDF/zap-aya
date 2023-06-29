const express = require("express")
const router = express.Router();

router.get("/", (req, res)=>{
    
    res.render("index",res.render("index",
    {
        success: req.flash("success"),
        error: req.flash("error"),
        number: req.flash("number"),
        message: req.flash("message"),

    }));
})

module.exports = router;