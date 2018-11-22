const express = require('express')
const router = express.Router()

const checkLogin = require('../../middlewares/check').checkLogin
const models = require('../../models')
const tools = require('../../tools')

// 路由前缀 /users/friends

// GET / 好友列表
router.get('/', checkLogin, function (req, res, next) {
  res.redirect('/users/friends/following')
})

// GET /following
router.get('/following', checkLogin, function (req, res, next) {
  let page = req.query.page?parseInt(req.query.page):1
  let rows = req.query.rows?parseInt(req.query.rows):30
  if (page < 1) page = 1
  if (rows < 1) rows = 1
  if (rows > 30) rows = 30
  let ret = {
    followings: [],
    pageinfo: {
      now: page,
      tot: 1,//Math.ceil(tot/rows)
      link: '/users/friends/following?',
      tag: '#followings'
    }
  }
  return models.User.findById(req.session.user.id).then(user=>{
    if(!user){
      req.flash('error','当前用户不存在')
      return res.redirect('back')
    }
    ret.pageinfo.tot = Math.ceil(user.count_followings/rows)
    return user.getFollowings_blackings({through: {where:{type:false}},offset:(page-1)*rows,limit:rows}).then(followings => {
      ret.followings = followings
      return res.render('following',ret);
    })
  }).catch(next)
})

// GET /follower
router.get('/follower', checkLogin, function (req, res, next) {
  let page = req.query.page?parseInt(req.query.page):1
  let rows = req.query.rows?parseInt(req.query.rows):30
  if (page < 1) page = 1
  if (rows < 1) rows = 1
  if (rows > 30) rows = 30
  let ret = {
    followers: [],
    pageinfo: {
      now: page,
      tot: 1,//Math.ceil(tot/rows)
      link: '/users/friends/follower?',
      tag: '#followers'
    }
  }
  return models.User.findById(req.session.user.id).then(user=>{
    if(!user){
      req.flash('error','当前用户不存在')
      return res.redirect('back')
    }
    ret.pageinfo.tot = Math.ceil(user.count_followers/rows)
    return user.getFollowers_blackers({through: {where:{type:false}},offset:(page-1)*rows,limit:rows}).then(followers => {
      ret.followers = followers
      return res.render('follower',ret);
    })
  }).catch(next)
})

// GET /blacklist 黑名单
router.get('/blacklist', checkLogin, function (req, res, next) {
  let page = req.query.page?parseInt(req.query.page):1
  let rows = req.query.rows?parseInt(req.query.rows):30
  if (page < 1) page = 1
  if (rows < 1) rows = 1
  if (rows > 30) rows = 30
  let ret = {
    blacklist: [],
    pageinfo: {
      now: page,
      link: '/users/friends/blacklist?',
      tag: '#blacklist'
    }
  }
  return models.User.findById(req.session.user.id).then(user=>{
    if(!user){
      req.flash('error','当前用户不存在')
      return res.redirect('back')
    }
    return user.getFollowings_blackings({through: {where:{type:true}},offset:(page-1)*rows,limit:rows}).then(blackings => {
      ret.blacklist = blackings
      return res.render('blacklist',ret);
    })
  }).catch(next)
})


module.exports = router