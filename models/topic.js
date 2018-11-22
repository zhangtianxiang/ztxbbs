const tools = require('../tools')

module.exports = (sequelize, DataTypes) => {
  let Topic = sequelize.define('Topic', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    raw_content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    authority_comment: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
      // 0 无限制 1 管理员回复 2 禁止回复
    },
    cover: {
      type: DataTypes.STRING
      // ,
      // allowNull: false,
      // defaultValue: 
      // 应当设置为默认cover
      // topic的cover为null时显示forum的cover并加模糊
      // 应当设置关系自动更新？？
    },
    sticky: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ' '
    },
    nickname: { // 发布者当时的昵称
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ' '
    },
    last_reply_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    last_reply_nickname: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'root'
    },
    last_reply_uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1 // 'root'的id默认为1
    },
    last_edit_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    count_edit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    count_view: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    count_reply: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    count_watch: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    count_collect: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    count_vote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    hooks: {
      beforeDestroy: (topic, options) => {
        tools.unlink(topic.cover)
      }
    }
  })

  Topic.associate = function(models) {
    models.Topic.belongsTo(models.User, {
      as: 'creator',
      // Topic将获得 getCreator和setCreator方法
      onDelete: 'SET NULL',
      foreignKey: {
        name: 'user_id',
        allowNull: true // 允许为空，当板块创建者被删，帖子仍然存在。
      }
    })
    models.Topic.belongsTo(models.Forum, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'forum_id',
        allowNull: false,
        defaultValue: 1 // 主版块为1
      }
    })
    models.Topic.hasMany(models.Comment, { foreignKey: 'topic_id' })
    // Topic 获得 getComments setComments
    models.Topic.belongsToMany(models.User, { as: 'watchers', through: 'UserWatchTopic', foreignKey: 'topic_id' })
    models.Topic.belongsToMany(models.User, { as: 'collectors', through: 'UserCollectTopic', foreignKey: 'topic_id' })
    models.Topic.belongsToMany(models.User, { as: 'voters', through: 'UserVoteTopic', foreignKey: 'topic_id' })
  }

  return Topic
}
    // user_id:  外键
    // forum_id: 外键