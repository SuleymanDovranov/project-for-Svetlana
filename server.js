const app = require('./app');

const { sequelize } = require('./models');

app.listen({ port: 5000 }, async () => {
  console.log('server up 5000');
  await sequelize.authenticate();
  await sequelize.sync({
    alter: true,
  });
});
