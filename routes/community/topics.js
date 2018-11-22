const express = require('express')
const router = express.Router()
const marked = require('marked')
// const Promise = require('bluebird')

const checkLogin = require('../../middlewares/check').checkLogin
const models = require('../../models')
const tools = require('../../tools')

// 前缀 /community/forums/topics

router.use('/comments', require('./comments'))

router.get('/create_topic', checkLogin, function (req, res, next) {
  // ?forum_id=XXX
  const fid = req.query.forum_id
  if (!fid) next()
  let ret = {
    forum: null,
    pre_forum_list: [],
    edit_forum: false,
    remove_forum: false
  }
  return models.Forum.findById(fid).then(forum => {
    try {
      if (!forum) throw new Error('该板块不存在')
      if (!tools.user_can_create_topic(req.session.user,forum)) throw new Error('您无权在此板块下创建主题')
    } catch (err) {
      req.flash('error',err)
      return res.redirect('back')
    }
    ret.forum = forum
  }).then(() => {
    return tools.get_pre_forums(ret.forum,ret.pre_forum_list)
  }).then(() => {
    return res.render('topic_create',ret)
  }).catch(next)
})

router.post('/create_topic', checkLogin, function (req, res, next) {
  // ?forum_id=XXX
  const fid = req.query.forum_id
  if (!fid) next()
  return models.Forum.findById(fid).then(forum => {
    try {
      if (!forum) throw new Error('该板块不存在')
      if (!tools.user_can_create_topic(req.session.user,forum)) throw new Error('您无权在此板块下创建主题')
    } catch (err) {
      req.flash('error',err)
      return res.redirect('back')
    }
    let newtopic = {
      title: req.fields.title,
      raw_content: req.fields.raw_content,
      user_id: req.session.user.id,
      forum_id: forum.id,
      nickname: req.session.user.nickname,
      last_reply_nickname: req.session.user.nickname,
      last_reply_uid: req.session.user.id
    }
    if (tools.user_can_manage_topic(req.session.user)) {
      newtopic.sticky = (req.fields.sticky=='on'?true:false)
      newtopic.authority_comment = req.fields.authority_comment
    } else {
      newtopic.sticky = false
      newtopic.authority_comment = 0
    }
    newtopic.content = marked(newtopic.raw_content)
    return models.Topic.create(newtopic).then(topic => {
      // 更新板块信息
      let delta = {
        last_reply_time: topic.create_time,
        last_reply_nickname: req.session.user.nickname,
        last_reply_uid: req.session.user.id,
        last_reply_topic: topic.title,
        last_reply_tid: topic.id
      }
      return tools.update_forum_last_reply(forum,delta).then(() => {
        return models.User.findById(req.session.user.id).then(user => {
          return user.update({count_topics:user.count_topics+1}).then(()=>{
            return forum.update({count_topics:forum.count_topics+1})
          }).then(()=>{
            return user.getFollowers_blackers({through: {where:{type:false}}}).then(followers => {
              let header = '你关注的 '+user.nickname+' 发表了新主题';
              let content = tools.get_abstract(topic.raw_content);
              let link = '/community/forums/topics'+topic.id;
              let show_avatar = user.avatar;
              let show_id = user.id;
              return Promise.all(followers.map(user=>{return models.Dynamic.create({
                header: header,
                content: content,
                link: link,
                show_avatar: show_avatar,
                show_id: show_id,
                user_id: user.id
              })}))
              // return tools.dynamic_follow_user_topic(followers,user,topic)
            })
          })
        })
      }).then(() => {
        return res.redirect('/community/forums/topics/'+topic.id)
      })
    })
  }).catch(next)
})

router.get('/:tid', function (req, res, next) {
  const tid = req.params.tid
  let page = req.query.page?parseInt(req.query.page):1
  let rows = req.query.rows?parseInt(req.query.rows):30
  if (page < 1) page = 1
  if (rows < 1) rows = 1
  if (rows > 30) rows = 30
  let ret = {
    forum: null,
    pre_forum_list: [],
    edit_topic: false,
    remove_topic: false,
    topic: null,
    creator: null,
    pageinfo: {
      now: page,
      tot: 1,//Math.ceil(tot/rows)
      link: '/community/forums/topics/'+tid+'?',
      tag: '#comments'
    }
  }
  return models.Topic.findById(tid).then(topic => {
    if (!topic) throw new Error('该主题不存在')
    ret.pageinfo.tot = Math.ceil(topic.count_reply/rows)
    ret.topic = topic
    ret.edit_topic = ret.remove_topic = tools.user_can_manage_topic(req.session.user,topic)
    return topic.getForum().then(forum => {
      if (!forum) throw new Error('该主题不存在父板块')
      ret.forum = forum
    }).then(() => {
      return topic.getCreator().then(creator => {
        ret.creator = creator
      })
    }).then(() => {
      return topic.update({count_view: topic.count_view+1})
    })
  }).then(() => {
    return tools.get_pre_forums(ret.forum,ret.pre_forum_list)
  }).then(() => {
    return ret.topic.getComments({ offset: (page-1)*rows, limit: rows }).then(comments => {
      return Promise.all(comments.map(comment => {
        return comment.getCreator().then(creator => {comment.creator = creator})
      })).then(() => {
        ret.topic.comments = comments
      })
    })
  }).then(() => {
    return res.render('topic',ret)
  }).catch(next)
})

router.get('/:tid/edit', checkLogin, function (req, res, next) {
  const tid = req.params.tid
  let ret = {
    forum: null,
    pre_forum_list: [],
    edit_topic: false,
    remove_topic: false,
    topic: null,
    creator: null
  }
  return models.Topic.findById(tid).then(topic => {
    if (!topic) throw new Error('该主题不存在')
    if (!tools.user_can_edit_topic(req.session.user,topic)) throw new Error('您无权修改该主题')
    ret.topic = topic
    return topic.getForum().then(forum => {
      if (!forum) throw new Error('该主题不存在父板块')
      ret.forum = forum
      return topic.getCreator().then(creator => {
        ret.creator = creator
      })
    })
  }).then(() => {
    return tools.get_pre_forums(ret.forum,ret.pre_forum_list)
  }).then(() => {
    return res.render('topic_edit',ret)
  }).catch(next)
})

router.post('/:tid/edit', checkLogin, function (req, res, next) {
  const tid = req.params.tid
  let delta = {}
  return models.Topic.findById(tid).then(topic => {
    if (!topic) throw new Error('该主题不存在')
    if (!tools.user_can_edit_topic(req.session.user,topic)) throw new Error('您无权修改该主题')
    delta.title = req.fields.title
    delta.raw_content = req.fields.raw_content
    if (tools.user_manage_topic(req.session.user)) {
      delta.authority_comment = req.fields.authority_comment
      delta.sticky = (req.fields.sticky=='on'?true:false)
    }
    delta.content = marked(req.fields.raw_content)
    delta.last_edit_time = new Date(Date.now())
    delta.count_edit = topic.count_edit+1
    return topic.update(delta).then(topic => {
      return res.redirect('/community/forums/topics/'+topic.id)
    })
  }).catch(next)
})

router.post('/:tid/remove', checkLogin, function (req, res, next) { // json
  const tid = req.params.tid
  let ret = { status:false,info:'' }
  return models.Topic.findById(tid).then(topic => {
    if (!topic) {
      ret.info = '该主题不存在'
      return res.send(ret)
    }
    if (!tools.user_can_manage_topic(req.session.user,topic)) {
      ret.info = '您无权删除此主题'
      return res.send(ret)
    }
    return topic.getCreator().then(creator => {
      return topic.getForum().then(forum => {
        if (!forum) {
          ret.info = '主题所在的板块不存在'
          return res.send(ret)
        }
        return topic.destroy().then(result => {
          if (result) {
            ret.success = true
            ret.info = '删除主题成功'
          } else {
            ret.info = '删除主题失败，原因未知'
          }
          if (ret.success === true && creator && creator.count_topics>0) {
            return creator.update({count_topics:creator.count_topics-1}).then(()=>{
              if (forum.count_topics > 0) return forum.update({count_topics:forum.count_topics-1})
              else return null
            })
          } else return null
        }).then(() => {
          return res.send(ret)
        })
      })
    })
    
  }).catch(err => {
    ret.info = err.message
console.log(err)
    return res.send(ret)
  })
})

router.post('/:tid/watch', checkLogin, function (req, res, next) { // json
  res.send('watch')
})

router.post('/:tid/unwatch', checkLogin, function (req, res, next) { // json
  res.send('unwatch')
})

router.post('/:tid/collect', checkLogin, function (req, res, next) {
  res.send('collect')
})

router.post('/:tid/uncollect', checkLogin, function (req, res, next) {
  res.send('uncollect')
})

router.post('/:tid/voteup', checkLogin, function (req, res, next) {
  res.send('voteup')
})

router.post('/:tid/votedown', checkLogin, function (req, res, next) {
  res.send('votedown')
})


/*
收藏不会有动态
watch会对comment产生动态
还可以like与unlike
*/

module.exports = router