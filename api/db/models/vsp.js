/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vsp', {
    sp_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    gid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    count: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    count_completed: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    tableName: 'vsp'
  });
};
