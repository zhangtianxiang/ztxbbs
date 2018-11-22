module.exports = (sequelize, DataTypes) => {
  let Message = sequelize.define('Message', {
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
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
      // 0 user_id发送 1 user_id接收
    },
    other_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    other_nickname: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'unknown'
    },
    other_avatar: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  })

  Message.associate = function(models) {
    models.Message.belongsTo(models.User, {
      // Message将获得 getUser和setUser方法
      onDelete: 'CASCADE', // 用户被删，他接到或发送的信息也删掉
      foreignKey: {
        name: 'user_id',
        allowNull: false
      }
    })
  }

  return Message
}