module.exports = (sequelize, DataTypes) => {
  const College = sequelize.define('College', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
    },
  });

  return College;
};
