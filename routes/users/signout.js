const express = require('express')
const router = express.Router()

const checkLogin = require('../../middlewares/check').checkLogin

// 路由前缀 /users/signout/

// GET / 登出
router.get('/', checkLogin, function (req, res, next) {
  req.session.user = null
  req.flash('success', '登出成功')
  res.redirect('back')
})

module.exports = router