module.exports = (sequelize, DataTypes) => {
  let Dynamic = sequelize.define('Dynamic', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    header: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    content: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // type: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   defaultValue: 0,
    //   // 1 watch topic
    //   // 2 follow user
    //   // 3 followed user followed other
    //   // 4 user follow you
    //   // 5 reply you
    // },
    link: {
      type: DataTypes.STRING,
      defaultValue: '#0'
    },
    show_avatar: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    show_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  })

  Dynamic.associate = function(models) {
    models.Dynamic.belongsTo(models.User, {
      // Dynamic将获得 getUser和setUser方法
      onDelete: 'CASCADE', // 用户被删，他的动态也删掉
      foreignKey: {
        name: 'user_id',
        allowNull: false
      }
    })
  }

  return Dynamic
}