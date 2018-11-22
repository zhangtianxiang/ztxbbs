const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const Sequelize = require('sequelize')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const flash = require('connect-flash')
const env = process.env.NODE_ENV || 'development'
const config = require('./config/config.js')[env]
const favicon = require('serve-favicon')
const logger = require('morgan')
const bodyParser = require('body-parser')
const sha1 = require('sha1')
const moment = require('moment')
const marked = require('marked')

const routes = require('./routes')
const userconfig = require('./config/userconfig')
const db = require('./models')
const tools = require('./tools')

// marked
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true
})
// 设置moment为中文
moment.locale('zh-cn')

const app = express()

// 设置模板目录
app.set('views', path.join(__dirname, 'views'))
// 设置模板引擎为ejs
app.set('view engine', 'ejs')

// 设置网站图标
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
// session 中间件
app.use(session({
  name: config.session.key, // 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret, // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new SequelizeStore({// 将 session 存储到 sequelize
    db: db.sequelize,
    checkExpirationInterval: config.session.checkExpires, // 每天删除过期session 
    expiration: config.session.maxAge // 会话时间30天
  }),
  resave: true, // 强制更新 session
  saveUninitialized: false, // 设置为 false，强制创建一个 session，即使用户未登录
}))

// flash 中间件
app.use(flash())

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'uploads'), // 上传文件目录
  keepExtensions: true// 保留后缀
}))

// 设置模板全局常量
app.locals.bbs = {
  title: userconfig.bbstitle,
  description: userconfig.bbsdescription
}

// 添加模板变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  res.locals.info = req.flash('info').toString()
  res.locals.warning = req.flash('warning').toString()
  res.locals.serverurl = req.headers.host
  res.locals.getbasename = function(str) {
    if (!str) return "default.jpg"
    return path.basename(str)
  }
  res.locals.moment = moment
  res.locals.country_name = tools.country_name
  next()
})

// 路由
routes(app)

// 处理 error 500&others
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  
  res.locals.message = err.message
  res.locals.error = (req.app.get('env') === 'development') ? err.message : {}

  // render the error page 应该以error page 还是 error消息呢？
  res.status(err.status || 500).render('error')

  // let error = (req.app.get('env') === 'development') ? err : {}
  // req.flash('error','something broken T_T')
  // res.send(error)
})

tools.inf('running with env: %s, (NODE_ENV: %s, BLUEBIRD_WARNINGS: %s)', app.get('env'), process.env.NODE_ENV, process.env.BLUEBIRD_WARNINGS)
module.exports = app
