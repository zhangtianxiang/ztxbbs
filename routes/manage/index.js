const express = require('express')
const router = express.Router()

const checkLogin = require('../../middlewares/check').checkLogin

// 前缀 /manage/
router.get('/', function (req, res, next) {
  res.redirect('/manage/status')
})

router.use('/settings', require('./settings'))
router.use('/notices', require('./notices'))


router.get('/status', function (req, res, next) {
  res.send('服务器状态')
})

module.exports = router