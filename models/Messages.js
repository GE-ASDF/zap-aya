const connection = require("../core/Model");
const sequelize = require("sequelize")

const Messages = connection.define("messages", {
    from:{
        type: sequelize.STRING,
        allowNull: false,
    },
    for:{
        type:sequelize.STRING,
        allowNull:false,
        defaultValue:"558596541425@c.us"
    },
    message:{
        type: sequelize.TEXT,
        allowNull: false,
    }
})


module.exports = Messages;