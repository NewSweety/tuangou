/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vorder', {
    oid: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    gid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    czr: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    g_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    g_createtime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    l_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    l_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    f_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sp_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    sp_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    gth: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tel: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    zt: {
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
    o_createtime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    o_updatetime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'vorder'
  });
};
