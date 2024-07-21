const { Model, DataTypes } = require("sequelize");
const connection = require("../database/DatabaseConnection");

class ShortURL extends Model {}

ShortURL.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  original_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  short_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize: connection,
  modelName: 'short_urls',
  timestamps: false
});

ShortURL.sync();

module.exports = ShortURL;