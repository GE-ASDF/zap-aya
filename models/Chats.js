const connection = require("../core/Model");
const sequelize = require("sequelize")

const Chats = connection.define("chats", {
    from:{
        type: sequelize.STRING,
        allowNull: false,
    }
})

module.exports = Chats;