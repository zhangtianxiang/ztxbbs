const express = require('express')
const router = express.Router()

const checkLogin = require('../../middlewares/check').checkLogin
const models = require('../../models')
const tools = require('../../tools')

// 前缀 /community/dynamic

router.get('/', checkLogin, function (req, res, next) {
  let page = req.query.page?parseInt(req.query.page):1
  let rows = req.query.rows?parseInt(req.query.rows):30
  if (page < 1) page = 1
  if (rows < 1) rows = 1
  if (rows > 30) rows = 30
  let ret = {
    dynamics: [],
    pageinfo: {
      now: page,
      link: '/community/dynamic?',
      tag: '#dynamics'
    }
  }
  return models.User.findById(req.session.user.id).then(user => {
    if (!user) {
      req.flash('当前用户不存在')
      return res.redirect('/users/'+req.session.user.id)
    }
    return user.getDynamics({ order:[['create_time','DESC']],offset: (page-1)*rows, limit: rows }).then(dynamics=>{
      ret.dynamics = dynamics
      return res.render('dynamics',ret)
    })
  }).catch(next)
})

module.exports = router