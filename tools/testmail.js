const mailer = require('./mailer');

// 创建一个邮件对象
let mail = {
    // 发件人
    from: 'ztxbbs <ztxbbs@126.com>',
    // 主题
    subject: '测试',
    // 收件人
    to: 'ztx97@qq.com',
    // 邮件内容，HTML格式
    text: '点击激活：1454664515' //接收激活请求的链接
};
mailer.sendMail(mail).then(info => {
    console.log(info)
}).catch(err=>{
    console.log(err)
})
/*
{ accepted: [ 'ztx97@qq.com' ],
  rejected: [],
  envelopeTime: 89,
  messageTime: 111,
  messageSize: 317,
  response: '250 Mail OK queued as smtp1,C8mowACnfJ1YfP5aW6emBA--.23542S3 1526627416',
  envelope: { from: 'ztxbbs@126.com', to: [ 'ztx97@qq.com' ] },
  messageId: '<1e3a9e88-4790-9e95-cc47-ad2ecbb62f69@126.com>' }
*/