const connection = require("../core/Model");
const sequelize = require("sequelize")

const Chats = connection.define("chats", {
    userId:{
        type: sequelize.INTEGER,
        allowNull: false,
    }
})

module.exports = Chats;