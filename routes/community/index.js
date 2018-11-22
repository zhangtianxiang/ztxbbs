const express = require('express')
const router = express.Router()

const checkLogin = require('../../middlewares/check').checkLogin

// 前缀 /community/
router.get('/', function (req, res, next) {
  res.redirect('/community/forums');
})

router.use('/dynamic', require('./dynamic'))
router.use('/forums', require('./forums'))

module.exports = router