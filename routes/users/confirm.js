const express = require('express')

const router = express.Router()

const checkLogin = require('../../middlewares/check').checkLogin
const models = require('../../models')
const userconfig = require('../../config/userconfig.js')
const mailer = require('../../tools/mailer');
const tools = require('../../tools');

// 路由前缀 /users/confirm/

router.get('/', checkLogin, function (req, res, next) { // confirm_mail
  const uid = req.session.user.id
  const code = req.query.confirm_code
  let interval = 30*60*1000 // 30分钟过期
  let last_time = 0
  let this_time = new Date().getTime()
  if (req.session.user.confirm_date) last_time = new Date(req.session.user.confirm_date).getTime()
  if (!code) {
    req.flash('error','验证码错误')
    return res.redirect('/users/'+uid)
  }
  if (tools.user_confirmed(req.session.user)) {
    req.flash('error','您已验证过邮箱')
    return res.redirect('/users/'+uid)
  }
  if (this_time-last_time > interval) {
    req.flash('error','该验证码已经过期'+((this_time-last_time)/1000/60/60)+'小时')
    return res.redirect('/users/'+uid)
  }
  if (tools.user_banned(req.session.user)) {
    req.flash('error','您已被封号，无法验证邮箱')
    return res.redirect('/users/'+uid)
  }
  return models.User.findById(uid).then(user => {
    if (!user) {
      req.flash('error','要验证的用户不存在')
      return res.redirect('/users/'+uid)
    }
    if (code !== user.confirm_code) {
      req.flash('error','验证码错误或不是当前用户的验证码')
      return res.redirect('/users/'+uid)
    }
    let delta = {
      authority_user: user.authority_user ^ (1<<1)
    }
    return user.update(delta).then(user => {
      req.flash('success','验证邮箱成功')
      user.password = ''
      user.confirm_code = ''
      req.session.user = user
      return res.redirect('/users/'+uid)
    })
  }).catch(next)
})

router.post('/', checkLogin, function (req, res, next) { // send_confirum_mail json
  const uid = req.session.user.id
  let ret = { success:false,info:''}
  let interval = 3*60*1000 // interval时间内不能重复发送邮件
  let last_time = 0
  let this_time = new Date().getTime()
  if (req.session.user.confirm_date) last_time = new Date(req.session.user.confirm_date).getTime()
  if (tools.user_confirmed(req.session.user)) {
    ret.info = '您已验证过邮箱'
    return res.send(ret)
  }
  if (this_time-last_time < interval) {
    ret.info = '请在'+((interval-this_time+last_time)/1000)+'秒后重试'
    return res.send(ret)
  }
  return models.User.findById(uid).then(user => {
    if (!user) {
      ret.info = '用户不存在'
      return res.send(ret)
    }
    let delta = {
      confirm_code: tools.get_confirm_code(),
      confirm_date: tools.get_confirm_date()
    }
    return user.update(delta).then(user => {
      let mail = {
        // 发件人
        from: 'ztxbbs <ztxbbs@126.com>',
        // 主题
        subject: '激活账号',
        // 收件人
        to: user.email, //发送给注册时填写的邮箱
        // 邮件内容，HTML格式
        text: '请在30分钟内点击激活：<a href="http://'+req.headers.host+'/users/confirm?confirm_code='+ user.confirm_code + '"></a>'
      }
      user.password = ''
      user.confirm_code = ''
      req.session.user = user
      return mailer.sendMail(mail).then(info => {
        if (info.accepted.length > 0) {
          ret.success = true
          ret.info = '发送成功'
          return res.send(ret)
        }
        ret.info = '发送失败'+info.response
        return res.send(ret)
      }).catch(err=>{
        ret.info = '发送失败'+err.message+'可能是邮箱格式错误'
        return res.send(ret)
      })
    })
  }).catch(err => {
console.log(err)/////
    ret.info = err.message
    return res.send(ret)
  })
})

module.exports = router