const { Transaction } = require('./../models');

(async () => {
  await Transaction.sync({ alter: true });
  console.log('DB Synced');
  process.exit(1);
})();
