const nodemailer = require('nodemailer')
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config.js')[env]


// mailer SMTP客户端对象
const mailer = nodemailer.createTransport(config.mailconfig)

// 发送邮件
module.exports = {
  sendMail: function (message) { // Promise
    return mailer.sendMail(message)
  }
}
/*
{ accepted: [ 'ztx97@qq.com' ],
  rejected: [],
  envelopeTime: 115,
  messageTime: 112,
  messageSize: 317,
  response: '250 Mail OK queued as smtp2,DMmowAD3oKXLpP1ayENpBA--.53664S3 1526572235',
  envelope: { from: 'ztxbbs@126.com', to: [ 'ztx97@qq.com' ] },
  messageId: '<04c53a83-2fa9-122f-c0bb-48daf35ceb88@126.com>' }

*/