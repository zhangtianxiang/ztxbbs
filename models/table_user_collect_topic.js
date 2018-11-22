module.exports = (sequelize, DataTypes) => {
  let UserCollectTopic = sequelize.define('UserCollectTopic', {
    create_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },{
    tableName: 'UserCollectTopic'
  })

  return UserCollectTopic
}
// user collect topic