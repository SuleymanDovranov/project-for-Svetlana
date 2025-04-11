const express = require('express');

const {
  withdraw,
  get,
  getUser,
  addMoney,
} = require('../controllers/transactionController');

const router = express.Router();

router.post('/transaction', withdraw);
router.get('/getAll', get);
router.get('/getAllUsers', getUser);
router.post('/addmoney/:id', addMoney);

module.exports = router;
