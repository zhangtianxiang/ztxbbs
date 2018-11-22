const express = require('express')
const router = express.Router()
const marked = require('marked')

const checkLogin = require('../../middlewares/check').checkLogin
const models = require('../../models')
const tools = require('../../tools')

// 路由前缀 /users/messages

// GET / 消息列表
router.get('/', checkLogin, function (req, res, next) {
  // res.send('消息列表')
  let page = req.query.page?parseInt(req.query.page):1
  let rows = req.query.rows?parseInt(req.query.rows):20
  if (page < 1) page = 1
  if (rows < 1) rows = 1
  if (rows > 30) rows = 30
  let ret = {
    messages: [],
    pageinfo: {
      now: page,
      tot: 1,
      link: '/users/messages?',
      tag: '#messages'
    }
  }
  return models.User.findById(req.session.user.id).then(user => {
    if (!user) {
      req.flash('error','当前用户不存在')
      return res.redirect('/users/'+req.session.user.id)
    }
    ret.pageinfo.tot = Math.ceil(user.count_messages/rows)
    return user.getMessages({ order:[['create_time','DESC']],offset:(page-1)*rows,limit:rows }).then(messages=>{
      ret.messages = messages
      return res.render('message',ret)
    })
  }).catch(next)
})


// GET /send
router.get('/send', checkLogin, function (req, res, next) {
  // ? user_id=XXX
  const uid = req.query.user_id?parseInt(req.query.user_id):0
  let ret = {
    send_to: null
  }
  if (uid) {
    return models.User.findById(uid).then(user=>{
      if (!user) {
        req.flash('要发送给的用户不存在')
        return res.redirect('/users/messages')
      }
      ret.send_to = user
      return res.render('message_send',ret)
    }).catch(next)
  } else {
    return res.render('message_send',ret)
  }
})
// post /send
router.post('/send', checkLogin, function (req, res, next) {
  const uid = req.fields.uid
  const raw_content = req.fields.raw_content
  const content = marked(req.fields.raw_content)
  const abstract = tools.get_abstract(req.fields.raw_content)
  if (!uid) {
    req.flash('error','未指定收信人')
    return res.redirect('back')
  }
  return models.User.findById(uid).then(receiver=>{
    if (!receiver) {
      req.flash('error','收信人不存在')
      return res.redirect('back')
    }
    return models.FollowOrBlack.findOne({where:{userA_id:receiver.id,userB_id:req.session.user.id,type:true}}).then(item=>{
      if (item) {
        req.flash('error','对方已将你拉黑')
        return res.redirect('back')
      }
      let newmessage1 = {
        user_id: req.session.user.id,
        raw_content: raw_content,
        content: content,
        abstract: abstract,
        type: false,
        other_id: receiver.id,
        other_nickname: receiver.nickname,
        other_avatar: receiver.avatar,
        read: true
      }
      let newmessage2 = {
        user_id: receiver.id,
        raw_content: raw_content,
        content: content,
        abstract: abstract,
        type: true,
        other_id: req.session.user.id,
        other_nickname: req.session.user.nickname,
        other_avatar: req.session.user.avatar,
        read: false
      }
      return models.Message.create(newmessage1).then(message=>{
        return models.User.findById(req.session.user.id).then(user=>{
          return user.update({count_messages:user.count_messages+1})
        }).then(()=>{
          return models.Message.create(newmessage2).then(message2=>{
            return receiver.update({count_messages:receiver.count_messages+1})
          })
        }).then(()=>{
          req.flash('success','发送私信成功')
          return res.redirect('/users/messages/'+message.id)
        })
      })
    })
  }).catch(next)
})

// GET /:mid/ 消息详情
router.get('/:mid', checkLogin, function (req, res, next) {
  let mid = req.params.mid
  return models.Message.findById(mid).then(message => {
    if (!message) {
      req.flash('error','私信不存在')
      return res.redirect('back')
    }
    if (req.session.user.id != message.user_id) {
      req.flash('error','您无权查看此私信')
      return res.redirect('back')
    }
    return res.render('message_detail',{message:message})
  }).catch(next)
})

// post /:mid/read
router.post('/:mid/read', checkLogin, function (req, res, next) {
  res.send('将消息XXX设置为已读')
})

// post /:mid/unread
router.post('/:mid/unread', checkLogin, function (req, res, next) {
  res.send('将消息XXX设置为未读')
})

// post /:mid/remove
router.post('/:mid/remove', checkLogin, function (req, res, next) {
  res.send('删除消息XXX')
})

// post /:mid/reply
router.post('/:mid/reply', checkLogin, function (req, res, next) {
  res.send('回复消息XXX，重定向至users/uid/message_send')
})

module.exports = router