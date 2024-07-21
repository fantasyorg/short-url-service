const { Sequelize } = require("sequelize");

const connection = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite"
});

module.exports = connection;