const express = require('express')
const sha1 = require('sha1')

const router = express.Router()

const checkNotLogin = require('../../middlewares/check').checkNotLogin
const models = require('../../models')
const userconfig = require('../../config/userconfig.js')
const mailer = require('../../tools/mailer');
const tools = require('../../tools');

// 路由前缀 /users/signup/

// GET / 注册页 
router.get('/', checkNotLogin, function (req, res, next) {
  return res.render('signup')
})

// POST / 用户注册
router.post('/', checkNotLogin, function (req, res, next) {
  let username = req.fields.username
  let password = req.fields.password
  let repassword = req.fields.repassword
  let email = req.fields.email

  let usernamemin = Math.max(userconfig.usernamemin || 3 , 0)
  let usernamemax = Math.max(userconfig.usernamemax || 12, usernamemin)
  let passwordmin = Math.max(userconfig.passwordmin || 3 , 0)
  let passwordmax = Math.max(userconfig.passwordmax || 12, passwordmin)
  let emailmin = 5 // A@A.A
  let emailmax = 320 // 邮箱地址最大长度 255+64+1=320

  try {
    if (!(username.length >= usernamemin && username.length <= usernamemax)) {
      throw new Error('用户名请限制在'+usernamemin.toString()+'至'+usernamemax.toString()+'个字符')
    }
    var reg = /^[0-9a-zA-Z]+$/
    if (!reg.test(username)) {
      throw new Error('用户名只允许使用字母和数字')
    }
    if (!(email.length >= emailmin && email.length <= emailmax)) {
      throw new Error('邮箱请限制在'+emailmin.toString()+'至'+emailmax.toString()+'个字符')
    }
    if (!(tools.check_email(email))) {
      throw new Error('输入的邮箱不是一个正确的邮箱')
    }
    if (!(password.length >= passwordmin && password.length <= passwordmax)) {
      throw new Error('密码请限制在'+passwordmin.toString()+'至'+passwordmax.toString()+'个字符')
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('/users/signup')
  }

  return models.User.create({
    username: req.fields.username,
    nickname: req.fields.username,
    password: sha1(password),
    email: req.fields.email,
    authority_user: (1<<1), // not confirmed
    confirm_code: tools.get_confirm_code(),
    confirm_date: tools.get_confirm_date(),
  }).then(user => {
    let mail = {
      from: 'ztxbbs <ztxbbs@126.com>',// 发件人
      subject: '激活账号',// 主题
      to: user.email, // 收件人  发送给注册时填写的邮箱
      text: '请在30分钟内点击激活：<a href="http://'+req.headers.host+'/users/confirm?user_id='+ user.id +'&confirm_code='+ user.confirm_code + '"></a>'
    };
    user.password = ''
    user.confirm_code = ''
    req.session.user = user
    mailer.sendMail(mail).then(info => {}).catch(err=>console.log(err.message))
    req.flash('success','注册成功，邮箱待验证，请检查邮箱')
    return res.redirect('/users/'+user.id+'/edit')
  }).catch(function (e) {
    // 用户名被占用则跳回注册页，而不是错误页
    if (e.name == 'SequelizeUniqueConstraintError') {
      if (e.fields.username) {
        req.flash('error', '用户名已被占用');
      } else if (e.fields.email) {
        req.flash('error', '邮箱已被使用');
      } else {
        req.flash('error', e.name);
      }
      return res.redirect('back');
    }
    next(e)
  })
})

module.exports = router