module.exports = {
  development: {
    mailconfig: {
      host: 'smtp.126.com',
      port: 25,
      auth: {
        user: 'ztxbbs@126.com',
        pass: 'XXXXXXXXXX'
        //process.env.MAIL_PASS //邮箱的授权码
      }
    },
    session: {
      secret: 'ztxbbs',
      key: 'ztxbbs',
      maxAge: 2592000000, // 一个月
      checkExpires: 86400000 // 24 * 60 * 60 * 1000 一天
    },
    db_username: 'root',
    db_password: '',
    db_database: 'ztxbbs',
    db_hostname: 'localhost',
    db_hostport: 3306,
    dialect: "mysql"// 默认使用的数据库
  },
  test: {
  },
  production: {
    mailconfig: {
      host: 'smtp.126.com',
      port: 25,
      auth: {
        user: 'ztxbbs@126.com',
        pass: process.env.MAIL_PASS
      }
    },
    session: {
      secret: 'sdjaodjaosid', // random string
      key: 'ztxbbs',
      maxAge: 2592000000 // 一个月
    },
    // db_username: 'root',
    // db_password: '',
    // db_database: 'ztxbbs',
    // db_hostname: 'localhost',
    // db_hostport: 3306,
    // dialect: "mysql"// 默认使用的数据库
    db_username: process.env.DB_USERNAME,
    db_password: process.env.DB_PASSWORD,
    db_database: process.env.DB_NAME,
    db_hostname: process.env.DB_HOSTNAME,
    db_hostport: process.env.DB_HOSTPORT,
    dialect: 'mysql'
  }
}
