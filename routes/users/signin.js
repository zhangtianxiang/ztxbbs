const express = require('express')
const sha1 = require('sha1')
const router = express.Router()

const checkNotLogin = require('../../middlewares/check').checkNotLogin
const models = require('../../models')
const tools = require('../../tools')

// 路由前缀 /users/signin/

// GET / 登录页
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signin', {backurl: req.headers.referer} )
})

// POST / 用户登录
router.post('/', checkNotLogin, function (req, res, next) {
  let username_or_email = req.fields.username_or_email
  let password = req.fields.password
  let backurl = req.query.backurl || 'back'
  try {
    if (!username_or_email.length) {
      throw new Error('请填写用户名或邮箱')
    }
    if (!password.length) {
      throw new Error('请填写密码')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }
  if (username_or_email.includes('@')) {
    // email
    return models.User.findOne({
      where: {email: username_or_email}
    }).then(user => {
      if (!user) {
        req.flash('error', '邮箱不存在')
        return res.redirect('back')
      }
      if (sha1(password) !== user.password) {
        req.flash('error', '邮箱或密码错误')
        return res.redirect('back')
      }
      user.last_login_time = new Date(Date.now());
      return user.save().then(()=>{
        user.password = ''
        user.confirm_code = ''
        req.session.user = user
        req.flash('success', '登陆成功')
        res.redirect(backurl)
        return null
      })
    }).catch(next)
  } else {
    // username
    return models.User.findOne({
      where: {username: username_or_email}
    }).then(user => {
      if (!user) {
        req.flash('error', '用户名不存在')
        return res.redirect('back')
      }
      if (sha1(password) !== user.password) {
        req.flash('error', '用户名或密码错误')
        return res.redirect('back')
      }
      user.last_login_time = new Date(Date.now());
      return user.save().then(()=>{
        user.password = ''
        user.confirm_code = ''
        req.session.user = user
        req.flash('success', '登陆成功')
        res.redirect(backurl)
        return null
      })
    }).catch(next)
  }
})

module.exports = router