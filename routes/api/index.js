const express = require('express')
const router = express.Router()

const checkLogin = require('../../middlewares/check').checkLogin

// 路由前缀 /api/

router.use('/signup', require('./signup'))
router.use('/signout', require('./signout'))
router.use('/message', require('./message'))
router.use('/friends', require('./friends'))

// GET /:uid
router.get('/:uid', checkLogin, function (req, res, next) {
  res.send('用户uid的资料页')
})
// GET /:uid/edit
router.get('/:uid/edit', checkLogin, function (req, res, next) {
  res.send('修改用户uid的资料页')
})
// POST /:uid/edit
router.post('/:uid/edit', checkLogin, function (req, res, next) {
  res.send('修改用户uid的资料')
})
// GET /:uid/admin_edit
router.get('/:uid/admin_edit', checkLogin, function (req, res, next) {
  res.send('管理用户uid页')
})
// POST /:uid/admin_edit
router.post('/:uid/admin_edit', checkLogin, function (req, res, next) {
  res.send('管理用户uid')
})
// GET /:uid/send_message
router.get('/:uid/send_message', checkLogin, function (req, res, next) {
  res.send('给uid发消息')
})
// post /:uid/send_message
router.post('/:uid/send_message', checkLogin, function (req, res, next) {
  res.send('给uid发消息')
})
// GET /:uid/follow
router.get('/:uid/follow', checkLogin, function (req, res, next) {
  res.send('关注uid')
})
// GET /:uid/unfollow
router.get('/:uid/unfollow', checkLogin, function (req, res, next) {
  res.send('取消关注uid')
})
// GET /:uid/ban
router.get('/:uid/ban', checkLogin, function (req, res, next) {
  res.send('拉黑uid')
})
// GET /:uid/unban
router.get('/:uid/unban', checkLogin, function (req, res, next) {
  res.send('取消拉黑uid')
})

module.exports = router