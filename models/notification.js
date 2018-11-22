module.exports = (sequelize, DataTypes) => {
  let Notification = sequelize.define('Notification', {
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
    broadcast_time: {
      type: DataTypes.DATE
      // allowNull: false,
      // defaultValue: true 一个notification只能广播一次
    }
  })

  Notification.associate = function(models) {
    models.Notification.belongsToMany(models.User, {as: 'notifiedusers', through: 'NotificationNotifyUser', foreignKey: 'notification_id' })
  }

  return Notification
}