const express = require('express')
const router = express.Router()
const marked = require('marked')

const checkLogin = require('../../middlewares/check').checkLogin
const models = require('../../models')
const tools = require('../../tools')
const userconfig = require('../../config/userconfig')

// 前缀 /community/forums/topics/comments

// router.get('/create_comment', checkLogin, function (req, res, next) {
//   // ?topic_id=XXX&reply_id=XXX
//   res.send('在主题tid下创建回复')
// })

router.post('/create_comment', checkLogin, function (req, res, next) {
  const tid = req.query.topic_id
  const rid = req.query.reply_id
  try {
    if (!tid) throw new Error('主题不存在')
    if (!tools.user_can_create_comment(req.session.user)) throw new Error('您无权回复')
  } catch (err) {
    req.flash('error',err.message)
    return res.redirect('back')
  }
  return models.Topic.findById(tid).then(topic => {
    if (!topic) throw new Error('该主题不存在')
    let newcomment = {
      raw_content: req.fields.raw_content,
      content: marked(req.fields.raw_content),
      abstract: tools.get_abstract(req.fields.raw_content,userconfig.abstract_length),
      nickname: req.session.user.nickname,
      user_id: req.session.user.id,
      topic_id: topic.id,
      last_reply_nickname: req.session.user.nickname,
      last_reply_uid: req.session.user.id
    }
    if (rid) {
      return models.Comment.findById(rid).then(reply_comment => {
        if (!reply_comment) throw new Error('回复的内容不存在')
        newcomment.reply_uid = reply_comment.user_id
        newcomment.reply_nickname = reply_comment.nickname
        newcomment.reply_abstract = reply_comment.abstract
        return models.Comment.create(newcomment).then(comment => {
          let topicdelta = {
            last_reply_time: comment.create_time,
            last_reply_nickname: req.session.user.nickname,
            last_reply_uid: req.session.user.id,
            count_reply: topic.count_reply+1
          }
          return tools.update_topic_last_reply(topic,topicdelta).then(() => {
            req.flash('success','回复成功')
            return res.redirect('back')
          })
        })
      })
    } else {
      return models.Comment.create(newcomment).then(comment => {
        let topicdelta = {
          last_reply_time: comment.create_time,
          last_reply_nickname: req.session.user.nickname,
          last_reply_uid: req.session.user.id,
          count_reply: topic.count_reply+1
        }
        return tools.update_topic_last_reply(topic,topicdelta).then(() => {
          req.flash('success','回复成功')
          return res.redirect('back')
        })
      })
    }
  }).catch(err => {
    console.log(err)
    req.flash('error','回复失败'+err.message)
    return res.redirect('back')
  })
})

// router.post('/create_comment', checkLogin, function (req, res, next) { // json
//   const tid = req.query.topic_id
//   const rid = req.query.reply_id
//   let ret = { sucess:false,info:'',comment:null }
//   try {
//     if (!tid) throw new Error('主题不存在')
//     if (!tools.user_can_create_comment(req.session.user)) throw new Error('您无权发帖')
//   } catch (err) {
//     ret.info = err
//     return res.send(ret)
//   }
//   return models.Topic.findById(tid).then(topic => {
//     if (!topic) {
//       ret.info = '主题不存在'
//       return res.send(ret)
//     }
//     let newcomment = {
//       raw_content: req.fields.raw_content,
//       content: marked(req.fields.raw_content),
//       abstract: tools.get_abstract(req.fields.raw_content,userconfig.abstract_length),
//       nickname: req.session.user.nickname,
//       user_id: req.session.user.id,
//       topic_id: tid
//     }
//     if (tid) {
//       return models.Comment.findById(rid).then(reply_comment => {
//         if (!reply_comment) throw new Error('回复的内容不存在')
//         newcomment.reply_uid = reply_comment.user_id
//         newcomment.reply_nickname = reply_comment.nickname
//         newcomment.reply_abstract = reply_comment.abstract
//         return models.Comment.create(newcomment).then(comment => {
//           ret.success = true
//           ret.info = '回复成功'
//           ret.comment = comment
//           return res.send(ret)
//         })
//       })
//     } else {
//       return models.Comment.create(newcomment).then(comment => {
//         ret.success = true
//         ret.info = '发帖成功'
//         ret.comment = comment
//         return res.send(ret)
//       })
//     }
//   }).catch(err => {
//     ret.info = err.message
//     return res.send(ret)
//   })
// })

// router.get('/:cid', checkLogin, function (req, res, next) {
//   res.send('回复cid')
// })

// router.get('/:cid/remove', checkLogin, function (req, res, next) {
//   res.send('删除回复')
// })

router.post('/:cid/remove', checkLogin, function (req, res, next) { // json
  const cid = req.params.tid
  let ret = { status:false,info:'' }
  return models.Comment.findById(cid).then(comment => {
    if (!comment) {
      ret.info = '该回复不存在'
      return res.send(ret)
    }
    if (!tools.user_can_remove_comment(req.session.user,comment)) {
      ret.info = '您无权删除此回复'
      return res.send(ret)
    }
    return comment.getTopic().then(topic => {
      if (!topic) {
        ret.info = '该回复所在的主题不存在'
        return res.send(ret)
      }
      return comment.destroy().then(result => {
        if (result) {
          ret.success = true
          ret.info = '删除回复成功'
        } else {
          ret.info = '删除回复失败，原因未知'
        }
        if (topic.count_reply > 0) {
          return topic.update({count_reply:(topic.count_reply>0?topic.count_reply-1:topic.count_reply)}).then(topic => {
            return res.send(ret)
          })
        } else {
          return res.send(ret)
        }
      })
    })
  }).catch(err => {
    ret.info = err.message
    return res.send(ret)
  })
})

// router.get('/:cid/edit', checkLogin, function (req, res, next) {
//   res.send('修改回复cid')
//   // 如果可以用ajax比较好
// })

router.post('/:cid/edit', checkLogin, function (req, res, next) {
  const cid = req.params.cid
  if (!tools.user_can_edit_comment(req.session.user,comment)) {
    req.flash('error','您无权编辑此回复')
    return res.redirect('back')
  }
  return models.Comment.findById(cid).then(comment => {
    if (!comment) {
      req.flash('error','该回复不存在')
      return res.redirect('back')
    }
    let delta = {
      raw_content: req.fields.raw_content,
      content: marked(req.fields.raw_content),
      abstract: tools.get_abstract(req.fields.raw_content,userconfig.abstract_length),
      last_edit_time: new Date(),
      count_edit: comment.count_edit+1
    }
    return comment.update(delta).then(comment => {
      req.flash('success','修改回复成功')
      return res.redirect('back')
    })
  }).catch(err => {
    req.flash('error','修改回复失败'+err.message)
    return res.redirect('back')
  })
})


router.post('/:cid/reply', checkLogin, function (req, res, next) { // json
  res.send('reply')
})

router.post('/:cid/voteup', checkLogin, function (req, res, next) {
  res.send('voteup')
})

router.post('/:cid/votedown', checkLogin, function (req, res, next) {
  res.send('votedown')
})

module.exports = router