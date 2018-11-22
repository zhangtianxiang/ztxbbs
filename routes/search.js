const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const models = require('../models')
const tools = require('../tools')
const userconfig = require('../config/userconfig')
const Op = require('sequelize').Op

// 路由前缀 /search/

router.get('/all', checkLogin, function(req, res, next) {
  let ret = {
    query: '',
    mode: 'all',
    show_all: false,
    show_user: false,
    show_topic: false,
    count_all: 0,
    count_user: 0,
    count_topic: 0,
    users: [],
    topics: [],
    pageinfo: {
      tot: 1,
      now: 1,
      link: '/search?',
      tag: '#result'
    }
  }
  res.render('search',ret)
})

router.post('/', checkLogin, function(req, res, next) {
  let mode = req.query.mode?req.query.mode:'all'
  let page = req.query.page?parseInt(req.query.page):1
  let rows = req.query.rows?parseInt(req.query.rows):20
  const query = req.fields.query
  if (page < 1) page = 1
  if (rows < 1) rows = 1
  if (rows > 30) rows = 30
  if (!query) {
    return res.redirect('/search')
  }
  if (mode!=='user' && mode!=='topic') mode = 'all'
  let ret = {
    query: query,
    mode: mode,
    show_all: (mode=='all'),
    show_user: (mode=='all' || mode=='user'),
    show_topic: (mode=='all' || mode=='topic'),
    count_all: 0,
    count_user: 0,
    count_topic: 0,
    users: [],
    topics: [],
    pageinfo: {
      tot: 1,
      now: page,
      link: '/search?mode='+mode+'&',
      tag: '#result'
    }
  }
  if (ret.show_all) {
    ret.pageinfo.tot = 1
    return models.User.findAndCountAll({
      where: {
        [Op.or]: [{
          username: {
            [Op.regexp]: query
          }
        }, {
          nickname: {
            [Op.regexp]: query
          }
        }, {
          id: {
            [Op.regexp]: query
          }
        }]
      },
      limit: 30
    }).then(result => {
      ret.count_user = result.count
      ret.users = result.rows
    }).then(() => {
      return models.Topic.findAndCountAll({
        where: {
          title: {
            [Op.regexp]: query
          }
        },
        limit: 20
      }).then(result => {
        ret.count_topic = result.count
        ret.topics = result.rows
      })
    }).then(() => {
      ret.count_all = ret.count_user + ret.count_topic
      return res.render('search',ret)
    }).catch(next)
  } else if (ret.show_user) {
    return models.User.findAndCountAll({
      where: {
        [Op.or]: [{
          username: {
            [Op.regexp]: query
          }
        }, {
          nickname: {
            [Op.regexp]: query
          }
        }]
      },
      offset: (page-1)*rows,
      limit: rows
    }).then(result => {
      ret.pageinfo.tot = Math.ceil(result.count/rows)
      ret.count_user = result.count
      ret.users = result.rows
      return res.render('search',ret)
    }).catch(next)
  } else if (ret.show_topic) {
    return models.Topic.findAndCountAll({
      where: {
        title: {
          [Op.regexp]: query
        }
      },
      offset: (page-1)*rows,
      limit: rows
    }).then(result => {
      ret.pageinfo.tot = Math.ceil(result.count/rows)
      ret.count_topic = result.count
      ret.topics = result.rows
      return res.render('search',ret)
    }).catch(next)
  } else return res.render('search',ret)
})

module.exports = router