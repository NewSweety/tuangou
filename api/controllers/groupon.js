const xlsx = require('node-xlsx');
const moment = require('moment');
const dbGroupon = require('../db').groupon;
const dbLd = require('../db').ld;
const dbFh = require('../db').fh;
const dbSp = require('../db').sp;
const vSp = require('../db').vsp;
const dbOrder = require('../db').order;
const vOrder = require('../db').vorder;
const sequelize = require('../db').sequelizeIns;
const config = require('../configs');
const util = require('../utils');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
  success,
  internalError,
} = config.responseCode;

/** 团购 */
class Groupon {
  
    /**
     * 解析excel，插入数据
     */
    static async processExcel(ctx) {
        const name = ctx.query.name;
        const sheet = ctx.query.sheet;
        try {
            // 读取excel
            const workSheetsFromFile = xlsx.parse(`${__dirname}/../utils/${name}.xlsx`);
            //   拆出需要的sheet
            const consumerData = workSheetsFromFile.find(
            (item) => item.name == sheet
            );
            const data = consumerData.data;

            // const row = {};
            // 添加批次名
            // row.groupon.name = name;
            let groupon = await dbGroupon.findOne({
                where: {
                    name: name
                }
            });
            if(!groupon) {
                groupon = await dbGroupon.create({
                    name,
                    createtime: moment()
                })
            }

            const header = data[0];
            const body = data.slice(1);
            // 下单人
            const xdridx = header.findIndex(item => item == '下单人');
            // 跟团号
            const gthidx = header.findIndex(item => item == '跟团号');
            // 商品
            const spidx = header.findIndex(item => item == '商品');
            // 数量索引
            const slidx = header.findIndex(item => item == '数量');
            // 电话索引
            const telidx = header.findIndex(item => item == '联系电话');
            // 代收
            const dsidx = header.findIndex(item => item == '可否代收本楼栋货物（仅本团购）');
            // 封控
            const fkidx = header.findIndex(item => item == '是否封控楼栋');
            // 楼栋索引
            const lidx = header.findIndex(item => item == '楼号');
            // 房号索引
            const fidx = header.findIndex(item => item == '房号');
            // 备注索引
            const bzidx = header.findIndex(item => item == '团员备注');

            for(let i=0;i<body.length;++i) {
                const data = body[i];
                // 判断楼栋是否添加
                let ld = await dbLd.findOne({
                    where: {
                        name: data[lidx]
                    }
                });
                if(!ld) {
                    ld = await dbLd.create({
                        name: data[lidx],
                        fk: data[fkidx] == '是' ? 2 : 1
                    })
                }else {
                    // 更新封控信息
                    ld.fk = data[fkidx] == '是' ? 2 : 1;
                    await ld.save();
                }
                // 判断房号是否添加
                let fh = await dbFh.findOne({
                    where: {
                        name: data[fidx]
                    }
                });
                if(!fh) {
                    fh = await dbFh.create({
                        name: data[fidx]
                    })
                }
                // 判断商品是否添加
                let sp = await dbSp.findOne({
                    where: {
                        name: data[spidx]
                    }
                });
                if(!sp) {
                    sp = await dbSp.create({
                        name: data[spidx],
                        gid: groupon.id
                    })
                }
                // 添加订单
                await dbOrder.create({
                    gid: groupon.id,
                    lid: ld.id,
                    fid: fh.id,
                    spid: sp.id,
                    gth: data[gthidx],
                    count: data[slidx],
                    xdr: data[xdridx],
                    ds: data[dsidx],
                    tel: data[telidx],
                    zt: 2,
                    bz: data[bzidx] ? (data[bzidx].split(':'))[1] : '',
                    createtime: moment(),
                    updatetime: moment()
                })
            }

            util.setHttpResponse(ctx, 200, success, 'order create success', {
                data: {
                    gid: groupon.id
                }
            });

        } catch (err) {
            console.log(err);
            util.setHttpResponse(ctx, 500, internalError, 'server internal error');
        }
    }

    /**
     * 解析excel，直传文件版本
     */
    static async processExcelByFile(ctx) {
        const inFile = ctx.request.files.file;
        const sheet = '顾客购买表';
        try {
            // 读取excel
            const workSheetsFromFile = xlsx.parse(inFile.path);
            //   拆出需要的sheet
            const consumerData = workSheetsFromFile.find(
            (item) => item.name == sheet
            );
            const data = consumerData.data;

            // 添加批次名
            let groupon = await dbGroupon.create({
                name: inFile.name,
                createtime: moment()
            })

            const header = data[0];
            const body = data.slice(1);
            // 下单人
            const xdridx = header.findIndex(item => item == '下单人');
            // 跟团号
            const gthidx = header.findIndex(item => item == '跟团号');
            // 商品
            const spidx = header.findIndex(item => item == '商品');
            // 数量索引
            const slidx = header.findIndex(item => item == '数量');
            // 电话索引
            const telidx = header.findIndex(item => item == '联系电话');
            // 代收
            const dsidx = header.findIndex(item => item == '可否代收本楼栋货物（仅本团购）');
            // 封控
            const fkidx = header.findIndex(item => item == '是否封控楼栋');
            // 楼栋索引
            const lidx = header.findIndex(item => item == '楼号');
            // 房号索引
            const fidx = header.findIndex(item => item == '房号');
            // 备注索引
            const bzidx = header.findIndex(item => item == '团员备注');
            // 判断格式是否正确
            if(xdridx == -1) {
                throw new Error('未查询到下单人');
            }
            if(gthidx == -1) {
                throw new Error('未查询到跟团号');
            }
            if(spidx == -1) {
                throw new Error('未查询到商品');
            }
            if(slidx == -1) {
                throw new Error('未查询到数量');
            }
            if(telidx == -1) {
                throw new Error('未查询到联系电话');
            }
            if(lidx == -1) {
                throw new Error('未查询到楼号');
            }
            if(fidx == -1) {
                throw new Error('未查询到房号');
            }
            if(fidx == -1) {
                throw new Error('未查询到房号');
            }
            if(bzidx == -1) {
                throw new Error('未查询到备注');
            }

            const map = new Map();
            for(let i=0;i<body.length;++i) {
                const data = body[i];

                // 判断楼栋是否添加
                let ld = await dbLd.findOne({
                    where: {
                        name: data[lidx]
                    }
                });
                if(!ld) {
                    ld = await dbLd.create({
                        name: data[lidx],
                        fk: fkidx != -1 ? (data[fkidx] == '是' ? 2 : 1) : 1
                    })
                }else {
                    // 更新封控信息
                    ld.fk = fkidx != -1 ? (data[fkidx] == '是' ? 2 : 1) : 1;
                    await ld.save();
                }
                // 判断房号是否添加
                let fh = await dbFh.findOne({
                    where: {
                        name: data[fidx]
                    }
                });
                if(!fh) {
                    fh = await dbFh.create({
                        name: data[fidx]
                    })
                }
                // 判断商品是否添加
                let spid = map.get(data[spidx]);
                if(!spid) {
                    let sp = await dbSp.create({
                        name: data[spidx],
                        gid: groupon.id
                    });
                    map.set(data[spidx], sp.id);
                    spid = sp.id;
                }
                // 添加订单
                await dbOrder.create({
                    gid: groupon.id,
                    lid: ld.id,
                    fid: fh.id,
                    spid: spid,
                    gth: data[gthidx],
                    count: data[slidx],
                    xdr: data[xdridx],
                    ds: dsidx ? data[dsidx] : '',
                    tel: data[telidx],
                    zt: 2,
                    bz: data[bzidx],
                    createtime: moment(),
                    updatetime: moment()
                })
            }


            const uuid = crypto
                .createHash('md5')
                .update(groupon.id + '', 'utf8')
                .digest('hex');

            groupon.uuid = uuid;
            await groupon.save();

            util.setHttpResponse(ctx, 200, success, 'order create success', {
                data: {
                    uuid: encodeURIComponent(uuid)
                }
            });

        } catch (err) {
            console.log(err);
            util.setHttpResponse(ctx, 500, internalError, err.message || 'server internal error');
        }
    }

    /**
     * 获取所有商品
     * @param {*} ctx 
     */
    static async getSp(ctx) {
        const gid = ctx.query.gid;

        const data = await vSp.findAll({
            where: {
                gid
            },
            attributes: {
              exclude: ['id']
            },
        });
        util.setHttpResponse(ctx, 200, success, 'sp create success', {
            data: data
        });
    }

    /**
     * 获取楼栋及相关信息
     * @param {*} ctx 
     */
    static async getLd(ctx) {
        const lh = ctx.query.lh;
        let spid = ctx.query.spid;
        let gid = ctx.query.gid;

        const where = {
            gid
        };
        if(lh) {
            where['l_name'] = lh;
        }
        if(!spid) {
            util.setHttpResponse(ctx, 200, success, 'order query success', {
                data: []
            });
            return;
        }
        // 查询该楼栋所有团购信息
        const  order = await vOrder.findAll({
            where: where,
            order: [[sequelize.cast(sequelize.col('l_name'), 'SIGNED'), 'DESC'], [sequelize.cast(sequelize.col('f_name'), 'SIGNED'), 'DESC']],
            attributes: {
              exclude: ['id']
            },
            raw: true
        });

        if(!order.length) {
            util.setHttpResponse(ctx, 200, success, 'order query success', {
                data: order
            });
            return;
        }

        // 组织数据结构
        // - 楼号
        //     - 户号
        //         - 商品+oid
        let res = [];
        for(let i=0;i<order.length;++i) {
            const data = order[i];
            let lidx = res.findIndex(item => item.name == data.l_name);
            if(lidx == -1) {
                res.push({
                    name: data.l_name,
                    fk: data.l_fk,
                    fhq: []
                });
                lidx = res.length-1;
            };
            let fidx = res[lidx].fhq.findIndex(item => item.name == data.f_name);
            if(fidx == -1) {
                res[lidx].fhq.push({
                    name: data.f_name,
                    tel: data.tel,
                    sp: []
                });
                fidx = res[lidx].fhq.length-1;
            }
            res[lidx].fhq[fidx].sp.push({
                oid: data.oid,
                sp_id: data.sp_id,
                xdr: data.xdr,
                czr: data.czr,
                name: data.sp_name,
                count: data.count,
                zt: data.zt,
                bz: data.bz
            });
        }

        if(spid) {
            // 筛选具有该商品的订单
            res = res.filter(item => {
                return item.fhq.some(itm => {
                    return itm.sp.some(it => {
                        return spid.indexOf(it.sp_id) != -1;
                    });
                })
            });
            // 筛选楼栋里有该商品的订单
            res.forEach((item, index) => {
                res[index].fhq = res[index].fhq.filter(itm => {
                    return itm.sp.some(it => {
                        return spid.indexOf(it.sp_id) != -1;
                    })
                })
            });
        }

        util.setHttpResponse(ctx, 200, success, 'order query success', {
            data: res
        });

    }

    /**
     * 修改商品
     * @param {*} ctx 
     */
    static async modifyOrder(ctx) {
        const oid = ctx.request.body.oid;
        const zt = ctx.request.body.zt;
        const czr = ctx.request.body.czr;

        await dbOrder.update({
            zt,
            czr
        }, {
            where: {
                id: oid
            }
        });

        util.setHttpResponse(ctx, 200, success, 'order modify success');
    }

    /**
     * 根据uuid查询批次
     * @param {*} ctx 
     */
    static async getGrouponByUUid(ctx) {
        const uuid = ctx.query.uuid;
        const groupon = await dbGroupon.findOne({
            where: {
                uuid
            }
        })
        if(groupon) {
            util.setHttpResponse(ctx, 200, success, 'query groupon success', {
                data: groupon
            });
        }else {
            util.setHttpResponse(ctx, 500, internalError, 'groupon error');
        }
    }

    /**
     * 下载模板
     * @param {*} ctx 
     */
    static async getTemplate(ctx) {
        const buffer = fs.createReadStream(
            path.resolve(__dirname, '../utils/assets/template.xlsx')
        );
        console.log(buffer);
        ctx.response.status = 200;
        ctx.body = buffer;
        ctx.set(
            'content-Disposition','attachment;filename=template.xlsx'
        );
        ctx.set(
            'content-type','application/vnd.openxmlformats'
        );
    }
}

exports = module.exports = Groupon;
