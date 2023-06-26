const connection = require("../core/Model");
const sequelize = require("sequelize")

const Messages = connection.define("messages", {
    from:{
        type: sequelize.STRING,
        allowNull: false,
    },
    message:{
        type: sequelize.TEXT,
        allowNull: false,
    }
})

module.exports = Messages;