const { User, Transaction, sequelize } = require('./../models');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 30 }); // Кэш на 30 сек

const recalculateBalance = async (userId) => {
  const transactions = await Transaction.findAll({
    where: { user_id: userId },
  });

  let balance = 0;
  for (const tx of transactions) {
    if (tx.action === 'deposit') balance += tx.amount;
    else if (tx.action === 'withdraw' || tx.action === 'purchase')
      balance -= tx.amount;
  }

  await User.update({ balance }, { where: { id: userId } });
  cache.set(`balance_${userId}`, balance);
  return balance;
};

exports.withdraw = catchAsync(async (req, res, next) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || amount <= 0) {
    return next(
      new AppError('Неверные данные. Убедитесь, что amount > 0', 400)
    );
  }

  const transaction = await sequelize.transaction();

  const user = await User.findByPk(userId, { transaction });
  if (!user) return next(new AppError('Пользователь не найден', 404));

  const cachedBalance = cache.get(`balance_${userId}`);
  const balance = cachedBalance !== undefined ? cachedBalance : user.balance;

  if (balance < amount) {
    await transaction.rollback();
    return next(new AppError('Недостаточно средств для списания', 400));
  }

  await Transaction.create(
    {
      user_id: userId,
      action: 'withdraw',
      amount,
    },
    { transaction }
  );

  const newBalance = await recalculateBalance(userId);
  await transaction.commit();

  return res.status(201).json({
    message: 'Списание успешно',
    balance: newBalance,
  });
});
