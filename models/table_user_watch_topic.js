module.exports = (sequelize, DataTypes) => {
  let UserWatchTopic = sequelize.define('UserWatchTopic', {
    create_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },{
    tableName: 'UserWatchTopic'
  })

  return UserWatchTopic
}
// user watch topic