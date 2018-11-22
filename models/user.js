const tools = require('../tools')

module.exports = (sequelize, DataTypes) => {
  let User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    sex: {
      type: DataTypes.ENUM('M', 'F', 'X'),
      allowNull: false,
      defaultValue: 'X'
    },
    birthday: {
      type: DataTypes.DATE
    },
    website: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.STRING
    },
    city: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    raw_introduction: {
      type: DataTypes.TEXT
    },
    raw_signature: {
      type: DataTypes.TEXT
    },
    avatar: {
      type: DataTypes.STRING
    },
    cover: {
      type: DataTypes.STRING
    },
    authority_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    authority_admin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    introduction: {
      type: DataTypes.TEXT
    },
    signature: {
      type: DataTypes.TEXT
    },
    reigister_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    last_login_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    count_topics: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    count_followers: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    count_followings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    confirm_code: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    confirm_date: {
      type: DataTypes.DATE // 以string存储的时间
    },
    count_messages: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    // 不添加时间戳属性 (updatedAt, createdAt)
    // timestamps: false,

    // 不删除数据库条目，但将新添加的属性deletedAt设置为当前日期（删除完成时）。 
    // paranoid 只有在启用时间戳时才能工作
    // paranoid: true,

    // 不使用驼峰样式自动添加属性，而是下划线样式，因此updatedAt将变为updated_at
    // underscored: true,

    // 禁用修改表名; 默认情况下，sequelize将自动将所有传递的模型名称（define的第一个参数）转换为复数。 如果你不想这样，请设置以下内容
    // freezeTableName: true,

    // 定义表的名称
    // tableName: 'Users',

    // 启用乐观锁定。 启用时，sequelize将向模型添加版本计数属性，
    // 并在保存过时的实例时引发OptimisticLockingError错误。
    // 设置为true或具有要用于启用的属性名称的字符串。
    // version: true,
    hooks: {
      beforeDestroy: (user, options) => {
        tools.unlink(user.cover)
        tools.unlink(user.avatar)
      }
    }
  })

  User.associate = function(models) {
    models.User.hasMany(models.Forum, { foreignKey: 'user_id' })
    // users 将获得 getForums和setForums属性
    models.User.hasMany(models.Topic, { foreignKey: 'user_id' })
    // users 将获得 getTopics和setTopics属性
    models.User.hasMany(models.Comment, { foreignKey: 'user_id' })
    // users 将获得 getComments和setComments属性
    models.User.hasMany(models.Message, { foreignKey: 'user_id' })
    // users 将获得 getMessages和setMessages属性
    models.User.hasMany(models.Dynamic, { foreignKey: 'user_id' })
    // users 将获得 getDynamics和setDynamics属性
    // A follow B
    models.User.belongsToMany(models.User, { as: 'followings_blackings', through: 'FollowOrBlack', foreignKey: 'userA_id' })
    models.User.belongsToMany(models.User, { as: 'followers_blackers', through: 'FollowOrBlack', foreignKey: 'userB_id' })
    models.User.belongsToMany(models.Topic, { as: 'watchings', through: 'UserWatchTopic', foreignKey: 'user_id' })
    models.User.belongsToMany(models.Topic, { as: 'collections', through: 'UserCollectTopic', foreignKey: 'user_id' })
    models.User.belongsToMany(models.Notification, { as: 'notifications', through: 'NotificationNotifyUser', foreignKey: 'user_id' })
    models.User.belongsToMany(models.Topic, { as: 'votedtopics', through: 'UserVoteTopic', foreignKey: 'user_id' })
    models.User.belongsToMany(models.Comment, { as: 'votedcomments', through: 'UserVoteComment', foreignKey: 'user_id' })
  }

  return User
}
