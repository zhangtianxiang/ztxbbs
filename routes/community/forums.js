const express = require('express')
const path = require('path')
const fs = require('fs')
const router = express.Router()

const checkLogin = require('../../middlewares/check').checkLogin
const models = require('../../models')
const tools = require('../../tools')

// 前缀 /community/forums

router.get('/', function (req, res, next) {
  return res.redirect('/community/forums/1')
  // let display = {}
  // return models.User.findAll()
  // .then(users => {
  //   display.users=users
  //   models.Forum.findAll()
  //   .then(forums => {
  //     display.forums = forums
  //     models.Topic.findAll()
  //     .then(topics => {
  //       display.topics = topics
  //       models.Comment.findAll()
  //       .then(comments => {
  //         display.comments = comments
  //         res.render('tmp',{content: display})
  //       })
  //     })
  //   })
  // })
})

router.use('/topics', require('./topics'))


router.get('/create_forum', checkLogin, function (req, res, next) {
  // ?forum_id=XXX
  const fid = req.query.forum_id
  try {
    if (!fid) {
      throw new Error('必须指定父板块')
    }
    if (!tools.user_can_create_forum(req.session.user)) {
      throw new Error('您无权在此版块下创建板块')
    }
  } catch (err) {
    req.flash('error',err)
    return res.redirect('back')
  }
  let ret = {
    forum: null,
    pre_forum_list: [],
    edit_forum: false,
    remove_forum: false
  }
  return models.Forum.findById(fid).then(father => {
    if (!father) {
      throw new Error('该父板块不存在')
    }
    ret.forum = father
    return tools.get_pre_forums(father,ret.pre_forum_list).then(() => {
      res.render('forum_create',ret)
      return null
    })
  }).catch(next)
})

router.post('/create_forum', checkLogin, function (req, res, next) {
  // ?forum_id=XXX
  const fid = req.query.forum_id
  if (!fid) next()
  if (!tools.user_can_create_forum(req.session.user)) {
    throw new Error('您无权在此版块下创建板块')
  }
  return models.Forum.findById(fid).then(father => {
    if (!father) throw new Error('该父板块不存在')
    let orgcover = ''
    if (req.files.cover) {
      if (req.files.cover.size > 0)
        orgcover = req.files.cover.path
      else
        fs.unlink(req.files.cover.path,err=>{if(err)return})
    }
    let basecover = path.basename(orgcover)
    let newcover = path.join(__dirname, '../../public','images','forumcover', basecover);
    if (orgcover) {
      fs.rename(orgcover,newcover,err=>{if (err){
        newcover = ''
        fs.unlink(orgcover,err=>{if(err)return})
      }})
    }
    let newforum = {
      title: req.fields.title,
      description: req.fields.description,
      sticky: (req.fields.sticky=='on'?true:false),
      authority_topic: req.fields.authority_topic,
      user_id: req.session.user.id,// 创建人
      forum_id: fid // 父板块
    }
    if (orgcover) newforum.cover = newcover
    return models.Forum.create(newforum).then(forum => {
      return res.redirect('/community/forums/'+forum.id)
    })
  }).catch(next)
})

router.get('/:fid', function (req, res, next) {
  const fid = req.params.fid
  let sort = req.query.sort?parseInt(req.query.sort):0
  let page = req.query.page?parseInt(req.query.page):1
  let rows = req.query.rows?parseInt(req.query.rows):30
  if (sort < 0) sort = 0
  if (sort > 3) sort = 0
  // 0 sort by replytime 1 sort by createtime 2 sort by reply 3 sort by view
  if (page < 1) page = 1
  if (rows < 1) rows = 1
  if (rows > 30) rows = 30
  let ret = {
    forum: null,
    pre_forum_list: [],
    edit_forum: tools.user_can_create_forum(req.session.user),
    remove_forum: tools.user_can_create_forum(req.session.user),
    sort: sort,
    pageinfo: {
      now: page,
      tot: 1,//Math.ceil(tot/rows)
      link: '/community/forums/'+fid+'?',
      tag: '&sort='+sort+'#topics'
    }
  }
  if (fid == 1) ret.remove_forum = false
  return models.Forum.findById(fid).then(forum => {
    if (!forum) throw new Error('该板块不存在')
    ret.pageinfo.tot = Math.ceil(forum.count_topics/rows)
    ret.forum = forum
    ret.forum.user_can_create_forum = tools.user_can_create_forum(req.session.user)
    ret.forum.user_can_create_topic = tools.user_can_create_topic(req.session.user,forum)
    return forum.getTopics({ where:{sticky:true},order:[['last_reply_time','DESC']] }).then(sticky_topics => {
      ret.forum.sticky_topics = sticky_topics
    }).then(()=>{
      if (sort == 1) {
        return forum.getTopics({ where:{sticky:false},offset: (page-1)*rows, limit: rows, order:[['create_time','DESC']] }).then(topics => {
          ret.forum.topics = topics
        })
      } else if (sort == 2) {
        return forum.getTopics({ where:{sticky:false},offset: (page-1)*rows, limit: rows, order:[['count_reply','DESC']] }).then(topics => {
          ret.forum.topics = topics
        })
      } else if (sort == 3) {
        return forum.getTopics({ where:{sticky:false},offset: (page-1)*rows, limit: rows, order:[['count_view','DESC']] }).then(topics => {
          ret.forum.topics = topics
        })
      } else {
        return forum.getTopics({ where:{sticky:false},offset: (page-1)*rows, limit: rows, order:[['last_reply_time','DESC']] }).then(topics => {
          ret.forum.topics = topics
        })
      }
    }).then(() => {
      return tools.get_forum_deep_4(ret.forum,1)
    }).then(() => {
      return tools.get_pre_forums(ret.forum,ret.pre_forum_list)
    }).then(() => {
      res.render('forum',ret)
      return null
    })
  }).catch(next)
})

router.get('/:fid/edit', checkLogin, function (req, res, next) {
  const fid = req.params.fid
  try {
    if (!tools.user_can_create_forum(req.session.user)) throw new Error('您无权编辑板块')
    if (fid == 1 && req.session.user.id != 1) throw new Error('根板块只能由root编辑') // the root forum
  } catch (err) {
    req.flash(err)
    return res.redirect('back')
  }
  let ret = {
    forum: null,
    creator: null,
    pre_forum_list: [],
    edit_forum: false,
    remove_forum: false
  }
  return models.Forum.findById(fid).then(forum => {
    if (!forum) throw new Error('该板块不存在')
    ret.forum = forum
    return forum.getCreator().then(creator => {
      ret.creator = creator
      return tools.get_pre_forums(forum,ret.pre_forum_list)
    }).then(() => {
      return res.render('forum_edit',ret)
    })
  }).catch(next)
})

router.post('/:fid/edit', checkLogin, function (req, res, next) {
  const fid = req.params.fid
  try {
    if (!tools.user_can_create_forum(req.session.user)) throw new Error('您无权编辑版块')
    if (fid == 1 && req.session.user.id != 1) throw new Error('根板块只能由root编辑')
  } catch (err) {
    req.flash(err)
    return res.redirect('back')
  }
  let delta = {}
  return models.Forum.findById(fid).then(forum => {
    if (!forum) throw new Error('该板块不存在')
    delta.title = req.fields.title
    delta.description = req.fields.description
    delta.sticky = ((req.fields.sticky=='on')?1:0)
    delta.authority_topic = req.fields.authority_topic
    let oldcover = forum.cover
    let orgcover = ''
    if (req.files.cover.size > 0) orgcover = req.files.cover.path
    else fs.unlink(req.files.cover.path,err=>{if(err)return})
    let basecover = path.basename(orgcover)
    let newcover = path.join(__dirname,'../../public','images','forumcover',basecover)
    if (orgcover) {
      fs.rename(orgcover,newcover,err=>{
        if (err) {
          newcover = ''
          fs.unlink(orgcover,err=>{if(err)return})
        }
      })
    }
    if (orgcover) delta.cover = newcover // 假定移动文件成功
    return forum.update(delta).then(forum => {
      if (orgcover && oldcover)
        fs.unlink(oldcover,err=>{if(err)return})
      req.flash('success','更新板块信息成功')
      return res.redirect('/community/forums/'+fid)
    }).catch(err=>{
      if (newcover)
        fs.unlink(newcover,err=>{if(err)return})
      req.flash('error',err.message)
      return res.redirect('back')
    })
  }).catch(next)
})

router.post('/:fid/remove', checkLogin, function (req, res, next) {
  const fid = req.params.fid
  let ret = { success:false,info:'' }
  try {
    if (fid == 1) throw new Error('根板块不能删除')
    if (!tools.user_can_create_forum(req.session.user)) throw new Error('您无权删除板块')
  } catch (err) {
    ret.info = err
    return res.send(ret)
  }
  return models.Forum.findById(fid).then(forum => {
    if (!forum) {
      ret.info = '该板块不存在'
      return res.send(ret)
    }
    return forum.destroy().then(result => {
      if (result) {
        ret.success = true
        ret.info = '删除板块成功'
      } else {
        ret.info = '删除板块失败，原因未知'
      }
      return res.send(ret)
    })
  }).catch(next)
})

module.exports = router