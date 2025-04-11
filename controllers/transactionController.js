const { Users, Transaction, sequelize } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 30 });

const recalculateBalance = async (userId, userBlanace, action, amount) => {
  let balance = userBlanace;

  if (action === 'deposit') {
    balance += amount;
  } else {
    if (action === 'withdraw' || action === 'purchase') balance -= amount;
  }

  await Users.update({ balance }, { where: { id: userId } });
  cache.set(`balance_${userId}`, balance);

  return balance;
};

exports.withdraw = catchAsync(async (req, res, next) => {
  console.log('HELLLOO');
  const { userId, amount, action } = req.body;

  const validActions = ['deposit', 'withdraw', 'purchase'];

  if (!validActions.includes(action)) {
    return next(
      new AppError('action должен быть: deposit, withdraw или purchase', 400)
    );
  }
  if (!userId || !amount || amount <= 0) {
    return next(
      new AppError('Неверные данные. Убедитесь, что amount > 0', 400)
    );
  }

  const transaction = await sequelize.transaction();

  const user = await Users.findByPk(userId, { transaction });
  if (!user) return next(new AppError('Пользователь не найден', 404));

  const cachedBalance = cache.get(`balance_${userId}`);
  const balance = cachedBalance !== undefined ? cachedBalance : user.balance;

  if (balance < amount) {
    await transaction.rollback();
    return next(new AppError('Недостаточно средств для списания', 400));
  }

  await Transaction.create(
    {
      userId: userId,
      action: action,
      amount: amount,
    },
    { transaction }
  );

  let userBlanace = user.balance;

  const newBalance = await recalculateBalance(
    userId,
    userBlanace,
    action,
    amount
  );
  await transaction.commit();

  return res.status(201).json({
    message: 'Списание успешно',
    balance: newBalance,
  });
});

exports.get = catchAsync(async (req, res, next) => {
  const all = await Transaction.findAll({
    include: [
      {
        model: Users,
        as: 'user',
      },
    ],
  });

  if (!all) return next(new AppError('Пока что пусто', 404));

  return res.status(200).send(all);
});

exports.getUser = catchAsync(async (req, res, next) => {
  const all = await Users.findAll({
    include: [
      {
        model: Transaction,
        as: 'transaction',
      },
    ],
  });

  if (!all) return next(new AppError('Пока что пусто', 404));

  return res.status(200).send(all);
});

exports.addMoney = catchAsync(async (req, res, next) => {
  let money = req.body.money;
  const user = await Users.findOne({ where: { id: req.params.id } });

  if (!user) return next(new AppError('Пока что пусто', 404));

  user.update({ balance: money });

  cache.set(`balance_${user.id}`, money);

  return res.status(200).send({ msg: 'YES' });
});
