const connection = require("../core/Model");
const sequelize = require("sequelize");
const Users = require("./Users");

const Chats = connection.define("chats", {
    userId:{
        type: sequelize.INTEGER,
        allowNull: false,
    },
    finalized:{
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
})

Users.hasMany(Chats);
Chats.belongsTo(Users);

module.exports = Chats;