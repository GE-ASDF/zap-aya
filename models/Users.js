const sequelize = require("sequelize")
const connection = require("../core/Model");

const Users = connection.define("users", {
    name:{
        type: sequelize.STRING,
        allowNull:true,
    },
    number:{
        type:sequelize.STRING,
        allowNull:false,
    },
    isStudent:{
        type:sequelize.INTEGER,
        allowNull:true,
    }
})

module.exports = Users;