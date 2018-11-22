module.exports = (sequelize, DataTypes) => {
  let UserVoteTopic = sequelize.define('UserVoteTopic', {
    create_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    num: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },{
    tableName: 'UserVoteTopic'
  })

  return UserVoteTopic
}
// user vote topic