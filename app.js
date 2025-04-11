const express = require('express');
const AppError = require('./utils/appError');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use(require('body-parser').json());
app.use('/start', require('./routes/transactionRouter'));

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(require('./controllers/errController'));

module.exports = app;
