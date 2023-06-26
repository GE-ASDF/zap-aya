const mysql2 = require("mysql2")
const { Sequelize } = require("sequelize"); 
require("dotenv").config();
const connection = new Sequelize(process.env.DBNAME, process.env.USER, process.env.PASS, {
    host:process.env.HOST,
    dialect: process.env.DIALECT,
})

module.exports = connection;