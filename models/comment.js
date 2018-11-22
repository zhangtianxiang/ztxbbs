module.exports = (sequelize, DataTypes) => {
  let Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    raw_content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    abstract: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    nickname: { // 发布者当时的昵称
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    reply_uid: {
      type: DataTypes.INTEGER
    },
    reply_nickname: {
      type: DataTypes.STRING
    },
    reply_abstract: {
      type: DataTypes.STRING
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
    count_vote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  })

  Comment.associate = function(models) {
    models.Comment.belongsTo(models.User, {
      as: 'creator',
      // Comment将获得 getCreator和setCreator方法
      onDelete: 'SET NULL',
      foreignKey: {
        name: 'user_id',
        allowNull: true // 允许为空，当创建者被删，评论仍然存在。
      }
    })
    models.Comment.belongsTo(models.Topic, {
      // Comment将获得 getTopic和setTopic方法
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'topic_id', // 帖子删除，评论删除
        allowNull: false
      }
    })
    models.Comment.belongsToMany(models.User, { as: 'voters', through: 'UserVoteComment', foreignKey: 'comment_id' })
  }

  return Comment
}