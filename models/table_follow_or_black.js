module.exports = (sequelize, DataTypes) => {
  let FollowOrBlack = sequelize.define('FollowOrBlack', {
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false, // 0 follow 1 blacklist
      defaultValue: false
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },{
    tableName: 'FollowOrBlack'
  })

  return FollowOrBlack
}
// userA follow or black userB