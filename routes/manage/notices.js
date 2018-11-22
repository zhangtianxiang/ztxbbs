const express = require('express')
const router = express.Router()

const checkLogin = require('../../middlewares/check').checkLogin

// 前缀 /manage/notices
router.get('/', function (req, res, next) {
  res.send('系统通知列表')
})

router.get('/create', function (req, res, next) {
  res.send('新建通知')
})

router.post('/create', function (req, res, next) {
  res.send('新建通知')
})

router.get('/:nid', function (req, res, next) {
  res.send('通知详情')
})

router.post('/:nid/broadcast', function (req, res, next) {
  res.send('通知广播')
})

module.exports = router