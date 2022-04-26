/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('order', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    gid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    lid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    fid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    gth: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    spid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    xdr: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ds: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tel: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    zt: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    czr: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    createtime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatetime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'order'
  });
};
