const express = require('express')
const router = express.Router()

const checkLogin = require('../../middlewares/check').checkLogin

// 前缀 /manage/settings
router.get('/', function (req, res, next) {
  res.send('论坛配置页')
})

router.post('/', function (req, res, next) {
  res.send('论坛配置保存')
})

module.exports = router