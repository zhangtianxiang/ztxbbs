const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const marked = require('marked')

const checkLogin = require('../../middlewares/check').checkLogin
const models = require('../../models')
const tools = require('../../tools')
const userconfig = require('../../config/userconfig')

// 路由前缀 /users/

router.use('/signin', require('./signin'))
router.use('/signup', require('./signup'))
router.use('/signout', require('./signout'))
router.use('/confirm', require('./confirm'))
router.use('/messages', require('./messages'))
router.use('/friends', require('./friends'))
router.use('/notice', require('./notice'))

// POST /follow
router.post('/follow', checkLogin, function (req, res, next) {
  const userA_id = req.session.user.id
  const userB_id = req.query.user_id
  if (userA_id == userB_id) {
    return res.send({status:false,info:'不能关注自己'})
  }
  return models.User.findById(userA_id).then(userA => {
    return models.User.findById(userB_id).then(userB => {
      return userA.hasFollowings_blackings(userB).then(result=>{
        if (result) {
          return models.FollowOrBlack.findOne({where: {userA_id: userA_id,userB_id: userB_id}}).then(item => {
            if (item.type === false) {
              return res.send({status:false,info:'已经关注了TA'})
            } else { // 将其从黑名单更新到关注列表
              return item.update({type:false,create_time:new Date(Date.now())}).then(() => {
                userA.update({count_followings: userA.count_followings+1})
                userB.update({count_followers: userB.count_followers+1})
                userA.getFollowers_blackers({ through: { where:{type:false}}}).then(followers => {
                  let header = '你关注的 '+userA.nickname+' 关注了 '+userB.nickname;
                  let content = ' ';
                  let link = '/users/'+userB.id;
                  let show_avatar = userA.avatar;
                  let show_id = userA.id;
                  return Promise.all(followers.map(user=>{return models.Dynamic.create({
                    header: header,
                    content: content,
                    link: link,
                    show_avatar: show_avatar,
                    show_id: show_id,
                    user_id: user.id
                  })}))
                  // return tools.dynamic_follow_user_user(followers,userA,userB)
                })
                let header = userA.nickname+' 关注了你';
                let content = ' ';
                let link = '/users/'+userA.id;
                let show_avatar = userA.avatar;
                let show_id = userA.id;
                models.Dynamic.create({
                  header: header,
                  content: content,
                  link: link,
                  show_avatar: show_avatar,
                  show_id: show_id,
                  user_id: userB.id
                })
                // tools.dynamic_follow_you(userB,userA)
                return res.send({status:true,info:'关注成功'})
              })
            }
          })
        } else {
          return userA.addFollowings_blackings(userB,{ through: {type:false}}).then(() => {
            userA.update({count_followings: userA.count_followings+1})
            userB.update({count_followers: userB.count_followers+1})
            userA.getFollowers_blackers({ through: {where:{type:false}}}).then(followers => {
              let header = '你关注的 '+userA.nickname+' 关注了 '+userB.nickname;
              let content = ' ';
              let link = '/users/'+userB.id;
              let show_avatar = userA.avatar;
              let show_id = userA.id;
              return Promise.all(followers.map(user=>{return models.Dynamic.create({
                header: header,
                content: content,
                link: link,
                show_avatar: show_avatar,
                show_id: show_id,
                user_id: user.id
              })}))
              // return tools.dynamic_follow_user_user(followers,userA,userB)
            }).catch(err=>{
              console.log(err);
            })
            let header = userA.nickname+' 关注了你';
            let content = ' ';
            let link = '/users/'+userA.id;
            let show_avatar = userA.avatar;
            let show_id = userA.id;
            models.Dynamic.create({
              header: header,
              content: content,
              link: link,
              show_avatar: show_avatar,
              show_id: show_id,
              user_id: userB.id
            })
            // tools.dynamic_follow_you(userB,userA)
            return res.send({status:true,info:'关注成功'})
          })
        }
      })
    })
  }).catch(err=>{
console.log(err);
  next(err)
  })
})

// POST /unfollow
router.post('/unfollow', checkLogin, function (req, res, next) {
  const userA_id = req.session.user.id
  const userB_id = req.query.user_id
  if (userA_id == userB_id) {
    return res.send({status:false,info:'没有关注自己'})
  }
  return models.User.findById(userA_id).then(userA => {
    return models.User.findById(userB_id).then(userB => {
      return userA.hasFollowings_blackings(userB).then(result=>{
        if (result) {
          return models.FollowOrBlack.findOne({where: {userA_id: userA_id,userB_id: userB_id}}).then(item => {
            if (item.type === false) { // 已经关注则取关
              return item.destroy().then(() => {
                userA.update({count_followings: userA.count_followings-1})
                userB.update({count_followers: userB.count_followers-1})
                return res.send({status:true,info:'取消关注成功'})
              })
            } else { // 黑名单
              return res.send({status:false,info:'尚未关注TA'})
            }
          })
        } else {
          return res.send({status:false,info:'尚未关注TA'})
        }
      })
    })
  }).catch(next)
})
// POST /ban
router.post('/ban', checkLogin, function (req, res, next) {
  const userA_id = req.session.user.id
  const userB_id = req.query.user_id
  if (userA_id == userB_id) {
    return res.send({status:false,info:'不能拉黑自己'})
  }
  return models.User.findById(userA_id).then(userA => {
    return models.User.findById(userB_id).then(userB => {
      return userA.hasFollowings_blackings(userB).then(result=>{
        if (result) {
          return models.FollowOrBlack.findOne({where: {userA_id: userA_id,userB_id: userB_id}}).then(item => {
            if (item.type === true) {
              return res.send({status:false,info:'已经拉黑了TA'})
            } else { // 将其从关注列表更新到黑名单
              return item.update({type:true,create_time:new Date(Date.now())}).then(() => {
                userA.update({count_followings: userA.count_followings-1})
                userB.update({count_followers: userB.count_followers-1})
                return res.send({status:true,info:'拉黑成功'})
              })
            }
          })
        } else {
          return userA.addFollowings_blackings(userB,{ through: { type: true}}).then(() => {
            return res.send({status:true,info:'拉黑成功'})
          })
        }
      })
    })
  }).catch(next)
})
// POST /unban
router.post('/unban', checkLogin, function (req, res, next) {
  const userA_id = req.session.user.id
  const userB_id = req.query.user_id
  if (userA_id == userB_id) {
    return res.send({status:false,info:'没有拉黑自己'})
  }
  return models.User.findById(userA_id).then(userA => {
    return models.User.findById(userB_id).then(userB => {
      return userA.hasFollowings_blackings(userB).then(result=>{
        if (result) {
          return models.FollowOrBlack.findOne({where: {userA_id: userA_id,userB_id: userB_id}}).then(item => {
            if (item.type === true) { // 已经拉黑则取消
              return item.destroy().then(() => {
                return res.send({status:true,info:'取消拉黑成功'})
              })
            } else {
              return res.send({status:false,info:'尚未拉黑TA'})
            }
          })
        } else {
          return res.send({status:false,info:'尚未拉黑TA'})
        }
      })
    })
  }).catch(next)
})

// GET /:uid
router.get('/:uid', function (req, res, next) {
  const uid = req.params.uid
  let ret = {}
  return models.User.findById(uid).then(show_user => {
    if (!show_user) throw new Error('用户不存在')
    ret.show_user = show_user
    ret.followed = false
    ret.banned = false
    ret.edit = tools.user_can_edit_user(req.session.user,show_user)
    if (!req.session.user) {
      res.render('user_profile',ret)
      return null
    }
    return models.FollowOrBlack.findOne({where: {userA_id: req.session.user.id,userB_id: show_user.id}}).then(item => {
      if (item) {
        if (item.type === false) ret.followed = true;
        else ret.banned = true;
      }
      res.render('user_profile',ret)
      return null
    })
  }).catch(next)
  // res.send('用户uid的资料页')
})
// GET /:uid/edit
router.get('/:uid/edit', checkLogin, function (req, res, next) {
  const uid = req.params.uid
  try {
    if (!tools.user_may_edit_user(req.session.user,uid)) {
      throw new Error('没有权限')
    }
  } catch(e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }
  return models.User.findById(uid).then(user => {
    try {
      if (!user) {
        throw new Error('用户不存在')
      }
      if (!tools.user_can_edit_user(req.session.user,user)) {
        throw new Error('没有权限')
      }
    } catch (e) {
      req.flash('error', e.message)
      return res.redirect('back')
    }
    return res.render('user_edit',{be_edit_user:user})
  }).catch(next)
})
// POST /:uid/edit
router.post('/:uid/edit', checkLogin, function (req, res, next) {
  const uid = req.params.uid
  try {
    if (!tools.user_may_edit_user(req.session.user,uid)) {
      throw new Error('没有权限')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('/users/'+uid)
  }
  return models.User.findById(uid).then(user => {
    try {
      if (!user) {
        throw new Error('用户不存在')
      }
      if (!tools.user_can_edit_user(req.session.user,user)) {
        throw new Error('没有权限')
      }
    } catch (e) {
      req.flash('error', e.message)
      return res.redirect('/users/'+uid)
    }
    let delta = {}
    if (req.session.user.id == uid) { // edit self
      delta.nickname = req.fields.nickname
      delta.sex = req.fields.sex
      if (req.fields.birthday) {
        delta.birthday = tools.get_utc_time(req.fields.birthday,req.fields.offset)
      }
      if (req.fields.email !== user.email) {
        delta.email = req.fields.email
        delta.confirm_code = ''
        delta.authority_user = user.authority_user|(1<<1)
      }
      delta.description = req.fields.description
      delta.raw_introduction = req.fields.raw_introduction
      delta.raw_signature = req.fields.raw_signature
      delta.country = req.fields.country
      delta.city = req.fields.city
      delta.website = req.fields.website
      delta.introduction = marked(delta.raw_introduction)
      delta.signature = marked(delta.raw_signature)
      try {
        if (!tools.in_range(delta.nickname.length,userconfig.usernamemin,userconfig.usernamemax)) {
          throw new Error('昵称长度限制在'+userconfig.usernamemin.toString()+'至'+userconfig.usernamemax.toString()+'内')
        }
        if (delta.sex!=='X' && delta.sex!=='M' && delta.sex!=='F') {
          throw new Error('性别请在下拉列表中选择')
        }
        if (req.fields.birthday) {
          let diff = tools.get_diff_day(delta.birthday,new Date(Date.now()))
          if (!tools.in_range(diff,1,userconfig.usermaxage)) {
            throw new Error('您的日期设置有误')
          }
        }
      } catch (e) {
        req.flash('error', e.message)
        return res.redirect('/users/'+uid+'/edit')
      }
    } else { // admin edit
      delta.authority_user = user.authority_user
      if ((req.session.user.authority_admin & (1|(1<<4))) > 0) {
        if (req.fields.ban == "on") delta.authority_user |= 1
        else if ((delta.authority_user & 1) > 0) delta.authority_user ^= 1
      }
      delta.authority_admin = user.authority_admin
      if ((req.session.user.authority_admin & (1|(1<<1))) > 0) { // root
        if (req.session.user.username == 'root') {
          if (req.fields.manage1 == "on") delta.authority_admin |= (1<<1)
          else if ((delta.authority_admin & (1<<1)) > 0) delta.authority_admin ^= (1<<1)
        }
        if (req.fields.manage2 == "on") delta.authority_admin |= (1<<2)
        else if ((delta.authority_admin & (1<<2)) > 0) delta.authority_admin ^= (1<<2)
        if (req.fields.manage3 == "on") delta.authority_admin |= (1<<3)
        else if ((delta.authority_admin & (1<<3)) > 0) delta.authority_admin ^= (1<<3)
        if (req.fields.manage4 == "on") delta.authority_admin |= (1<<4)
        else if ((delta.authority_admin & (1<<4)) > 0) delta.authority_admin ^= (1<<4)
        if (req.fields.manage5 == "on") delta.authority_admin |= (1<<5)
        else if ((delta.authority_admin & (1<<5)) > 0) delta.authority_admin ^= (1<<5)
        if (req.fields.manage6 == "on") delta.authority_admin |= (1<<6)
        else if ((delta.authority_admin & (1<<6)) > 0) delta.authority_admin ^= (1<<6)
      }
    }
    let oldavatar = user.avatar
    let oldcover = user.cover
    let orgavatar = ''
    if (req.files.avatar) {
      if (req.files.avatar.size > 0)
        orgavatar = req.files.avatar.path
      else fs.unlink(req.files.avatar.path,err=>{if(err)return})
    }
    let orgcover = ''
    if (req.files.cover) {
      if (req.files.cover.size > 0)
        orgcover = req.files.cover.path
      else fs.unlink(req.files.cover.path,err=>{if(err)return})
    }
    let baseavatar = path.basename(orgavatar)
    let basecover = path.basename(orgcover)
    let newavatar = path.join(__dirname, '../../public', 'images', 'avatars', baseavatar)
    let newcover = path.join(__dirname, '../../public', 'images', 'usercover', basecover)
    let changeavatar = true
    let changecover = true
    if (orgavatar) {
      fs.rename(orgavatar,newavatar,err=>{if (err) {
        changeavatar = false
        fs.unlink(orgavatar,err=>{if(err) return})
      }})
    } else changeavatar = false
    if (req.files.cover && req.files.cover.size > 0) {
      fs.rename(orgcover,newcover,err=>{if (err) {
        changecover = false
        fs.unlink(orgcover,err=>{if (err) return})
      }})
    } else changecover = false
    if (changeavatar) delta.avatar = newavatar
    if (changecover) delta.cover = newcover
    return user.update(delta).then(user => {
      if (changeavatar && oldavatar) {
        fs.unlink(oldavatar,err=>{if (err) return})
      }
      if (changecover && oldcover) {
        fs.unlink(oldcover,err=>{if (err) return})
      }
      // 不要忘记更新session中的user
      if (uid == req.session.user.id) {
        user.password = ''
        user.confirm_code = ''
        req.session.user = user
      }
      req.flash('success','更新资料成功')
      return res.redirect('/users/'+uid)
    }).catch(err => {
      req.flash('error','更新资料失败',err)
      if (changeavatar) {
        fs.unlink(newavatar,err=>{if (err) return})
      }
      if (changecover) {
        fs.unlink(newcover,err=>{if (err) return})
      }
      return res.redirect('back')
    })
  }).catch(next)
})

module.exports = router