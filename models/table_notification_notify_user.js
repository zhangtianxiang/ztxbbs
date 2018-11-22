module.exports = (sequelize, DataTypes) => {
  let NotificationNotifyUser = sequelize.define('NotificationNotifyUser', {
    create_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },{
    tableName: 'NotificationNotifyUser'
  })

  return NotificationNotifyUser
}
// user watch topic