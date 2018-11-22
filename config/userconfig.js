module.exports = {
  // 所有属性在数据库运行起来后不可更改
  // 可更改配置将在manage页面中出现
  // 设置环境变量
  // 正式使用时务必设置 NODE_ENV = production
  // 正式使用时务必设置环境变量 ZTXBBSPASS
  port: 2333, // 优先读取环境变量 ZTXBBSPORT
  bbstitle: 'ztxbbs', // 整个网站的名字
  bbsdescription: '由ztx编写的hzoj的bbs系统', // 对bbs系统的简短描述
  usernamemin: 3, // 用户名长度min
  usernamemax: 12,// 用户名长度max
  passwordmin: 6,// 密码最短长度
  passwordmax: 16,// 密码最长长度
  descriptionmax: 64,// 最长个人描述
  introductionmax: 4096,// 最长个人介绍
  signature: 233,// 最长签名
  usermaxage: 150*365, // 最大年龄（天数）
  abstract_length: 24 // 摘要长度
}