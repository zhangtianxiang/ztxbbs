const express = require('express')
const router = express.Router()
const marked = require('marked')

const checkLogin = require('../../middlewares/check').checkLogin

// 路由前缀 /users/notice

router.get('/', checkLogin, function (req, res, next) {
  res.send('通知列表')
})

// post /:nid/read
router.post('/:nid/read', checkLogin, function (req, res, next) {
  res.send('将通知XXX设置为已读')
})

// post /:nid/unread
router.post('/:nid/unread', checkLogin, function (req, res, next) {
  res.send('将通知XXX设置为未读')
})

// post /:nid/remove
router.post('/:nid/remove', checkLogin, function (req, res, next) {
  res.send('删除通知XXX')
})

module.exports = router