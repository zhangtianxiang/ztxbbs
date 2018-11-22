const tools = require('../tools')

module.exports = (sequelize, DataTypes) => {
  let Forum = sequelize.define('Forum', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ' '
    },
    authority_topic: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
      // 0 无限制 1 管理员发帖 2 禁止发帖
    },
    cover: {
      type: DataTypes.STRING
      // ,
      // allowNull: false,
      // defaultValue: 
      // 应当设置为默认cover
    },
    sticky: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    last_reply_topic: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "还没有主题哦"
    },
    last_reply_tid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    count_topics: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    hooks: {
      beforeDestroy: (forum, options) => {
        tools.unlink(forum.cover)
      }
    }
  })

  Forum.associate = function(models) {
    models.Forum.belongsTo(models.User, {
      as: 'creator',
      // forum将获得 getCreator和setCreator方法
      onDelete: 'SET NULL',
      foreignKey: {
        name: 'user_id',
        allowNull: true // 允许为空，当板块创建者被删，板块仍然存在。
      }
    })
    models.Forum.belongsTo(models.Forum, {
      onDelete: 'CASCADE',
      // getForum setForum
      foreignKey: {
        name: 'forum_id',
        allowNull: true,
        defaultValue: 1 // 主版块为1
      }
    })
    models.Forum.hasMany(models.Forum, { foreignKey: 'forum_id' })
    // getForums setForums 子版块
    models.Forum.hasMany(models.Topic, { foreignKey: 'forum_id' })
    // getTopics setTopics
  }

  return Forum
}
    // user_id:  外键
    // forum_id: 外键