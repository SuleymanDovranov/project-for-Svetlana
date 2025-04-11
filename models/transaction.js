'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate({ Users }) {
      this.belongsTo(Users, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }
  Transaction.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaulValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      ts: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'transactions',
      modelName: 'Transaction',
    }
  );
  return Transaction;
};
