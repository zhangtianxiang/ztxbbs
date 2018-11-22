module.exports = (sequelize, DataTypes) => {
  let UserVoteComment = sequelize.define('UserVoteComment', {
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
    tableName: 'UserVoteComment'
  })

  return UserVoteComment
}
// user vote comment