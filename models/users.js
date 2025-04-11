'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate({ Transaction }) {
      this.hasMany(Transaction, {
        foreignKey: 'userId',
        as: 'transaction',
      });
    }
  }
  Users.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
      },
      balance: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: 'users',
      modelName: 'Users',
    }
  );
  return Users;
};
