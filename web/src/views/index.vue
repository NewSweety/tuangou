<template>
  <div style="position: absolute; width: 100%; height: 100%; top: 0; left: 0">
    <el-dialog
      title="请输入登录token"
      :visible.sync="isNLogin"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      custom-class="login_wrap"
    >
      <el-input type="text" v-model="token"></el-input>
      <el-button type="primary" @click="toLogin">确定登录</el-button>
    </el-dialog>
    <div class="map_btn" @click="getMap">
      {{ isMap ? '关闭地图' : '查看地图' }}
    </div>
    <div class="map" v-if="isMap">
      <img src="@/utils/IMG_4921.jpg" alt="" />
    </div>
    <!-- 左侧楼栋群 -->
    <div class="left">
      <div class="filters">
        <p
          :class="{ success: search.includes(item.sp_id) }"
          @click="goSearch(item.sp_id)"
          :key="index"
          v-for="(item, index) of searchList"
        >
          {{ item.name.split('(')[0] }}（{{ item.count_completed }}/{{
            item.count
          }}）
        </p>
      </div>
      <div id="ldq">
        <p
          :class="{
            success: ldIsSccess(item),
            fk: item.fk == 2,
            selected: currentLd.name == item.name,
          }"
          :key="index"
          v-for="(item, index) of ldList"
          @click="searchLd(item)"
        >
          {{ item.name }}号楼({{
            getCompletedByLd(item) + '/' + getTotalByLd(item)
          }})
        </p>
      </div>
    </div>
    <!-- 右侧信息显示和操作按钮 -->
    <div class="lh" v-if="currentLd">
      楼号：<span>{{ currentLd.name }}号楼</span>
    </div>
    <div class="right" v-if="currentLd">
      <div id="desc">
        <div class="fhq" :key="index" v-for="(fh, index) of currentLd.fhq">
          <div class="fh">
            房号：<span>{{ fh.name }}</span>
          </div>
          <div class="tel">
            手机号：<a :href="'tel:' + fh.tel">{{ fh.tel }}</a>
          </div>
          <div class="fh">
            微信名：<span>{{ fh.sp[0].xdr }}</span>
            <i
              class="el-icon-document-copy"
              style="padding: 10px; color: blue"
              @click="copy(fh.sp[0].xdr)"
            ></i>
          </div>
          <div class="sp">
            <p class="title">商品信息：</p>
            <div
              :class="{ sp_item: true, success: sp.zt == 1, fail: sp.zt == 2 }"
              :key="index"
              v-for="(sp, index) of fh.sp"
              @click="changeOrder(fh.name, sp)"
            >
              <p class="sp_name"><span>商品名：</span>{{ sp.name }}</p>
              <p class="sp_sl"><span>数量：</span>{{ sp.count }}</p>
              <p
                :class="{ sp_zt: true, success: sp.zt == 1, fail: sp.zt == 2 }"
              >
                <span>状态：</span>{{ sp.zt == 1 ? '已送货' : '未送货' }}
              </p>
              <p class="sp_sl" v-if="sp.czr">
                <span>操作人：</span>{{ sp.czr.split('admin')[1] }}
              </p>
            </div>
          </div>
          <p style="margin-top: 30px; border: 2px solid #000"></p>
        </div>
      </div>
      <p style="text-align: center; font-weight: bold; font-size: 12px">
        到底了
      </p>
    </div>
  </div>
</template>
<script>
import Axios from '@/utils/axios';
import { copy } from 'mini-toolkit';
// import moment from 'moment';

export default {
  data() {
    return {
      gid: null,
      isNLogin: false,
      token: '',
      isMap: false,
      loading: false,
      flag: false,
      search: [],
      currentLd: {},
      searchList: [],
      ldList: [],
    };
  },
  methods: {
    getCompletedByLd(data) {
      const fhq = data.fhq;
      let total = 0;
      for (let i = 0; i < fhq.length; ++i) {
        for (let j = 0; j < fhq[i].sp.length; ++j) {
          total += fhq[i].sp[j].zt == 1 ? fhq[i].sp[j].count : 0;
        }
      }
      return total;
    },
    getTotalByLd(data) {
      const fhq = data.fhq;
      let total = 0;
      for (let i = 0; i < fhq.length; ++i) {
        for (let j = 0; j < fhq[i].sp.length; ++j) {
          total += fhq[i].sp[j].count;
        }
      }
      return total;
    },
    getMap() {
      this.isMap = !this.isMap;
    },
    ldIsSccess(ld) {
      return ld.fhq.every((item) => {
        return item.sp.every((itm) => {
          if (this.search.includes(itm.sp_id)) {
            return itm.zt == 1;
          } else {
            return true;
          }
          // return this.search.includes(itm.sp_id) && itm.zt == 1;
        });
      });
    },
    goSearch(id) {
      const idx = this.search.findIndex((item) => item == id);
      if (idx != -1) {
        this.search.splice(idx, 1);
      } else {
        this.search.push(id);
      }
      this.flag = false;
      this.currentLd = {};
      this.getLdList();
    },
    searchLd(row) {
      this.currentLd = this.ldList.find((item) => item.name == row.name);
      this.getLdList();
    },
    async getLdList() {
      let url = `/ld?spid=${this.search}&gid=${this.gid}`;
      const res = await Axios.get(url);
      this.loading = false;
      if (res.data.responseCode == 0) {
        this.ldList = res.data.data;
        if (JSON.stringify(this.currentLd) === '{}') {
          this.currentLd = res.data.data[0];
        } else {
          // 更新currentLd
          this.currentLd = this.ldList.find(
            (item) => item.name == this.currentLd.name
          );
        }
      }
    },
    async getSp() {
      const res = await Axios.get(`/sp?gid=${this.gid}`);
      if (res.data.responseCode == 0) {
        this.searchList = res.data.data;
      }
    },
    async changeOrder(fh, sp) {
      this.$confirm(
        `确认修改${this.currentLd.name}-${fh}的商品“${sp.name}”状态为“${
          sp.zt == 1 ? '未送货' : '已送货'
        }”？`
      )
        .then(async (_) => {
          const zt = sp.zt == 1 ? 2 : 1;
          await Axios.post('/order', {
            oid: sp.oid,
            zt: zt,
            czr: localStorage.getItem('token'),
          });
          this.getLdList();
          this.getSp();
        })
        .catch((_) => {});
    },
    setTimer() {
      setInterval(() => {
        this.loading = true;
        this.getLdList();
        this.getSp();
      }, 30000);
    },
    async toLogin() {
      if (this.token.indexOf('admin') == -1) {
        this.$message.error({
          message: 'token无效',
        });
      } else {
        this.$message.success('登录成功');
        this.isNLogin = false;
        localStorage.setItem('token', this.token);
      }
    },
    copy(text) {
      copy(text);
      this.$message.success('拷贝成功');
    },
  },
  mounted() {
    this.gid = this.$route.query.gid;
    if (!this.gid) {
      this.$message.error('链接不正确');
      return;
    }
    this.getLdList();
    this.getSp();
    this.setTimer();
    if (!localStorage.getItem('token')) {
      this.isNLogin = true;
    }
  },
};
</script>
<style lang="scss" scoped>
/* 公共样式 */
* {
  margin: 0;
  padding: 0;
}

ul,
li,
dl,
dt {
  list-style: none;
}

a {
  text-decoration: none;
}

img {
  display: block;
}

input {
  border: none;
  font-family: helvetica, 'Microsoft YaHei', '黑体';
  letter-spacing: 2px;
}

*,
*:after,
*:before {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

body {
  font-family: helvetica, 'Microsoft YaHei', '黑体';
  letter-spacing: 2px;
  background: #fff;
  -webkit-text-size-adjust: none;
  -moz-text-size-adjust: none;
  -ms-text-size-adjust: none;
  outline: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  overflow: hidden;
}

select,
input {
  border-radius: 0;
  word-break: break-all;
  background: transparent;
  border: none;
  background-color: rgba(0, 0, 0, 0);
  border-color: transparent;
  -moz-appearance: none;
  appearance: none;
  -webkit-appearance: none;
}

.none {
  display: none;
}

/************************* */

.map_btn {
  position: fixed;
  width: 50px;
  height: 50px;
  top: 50%;
  right: 15px;
  background-color: orange;
  border-radius: 50%;
  text-align: center;
  line-height: 50px;
  z-index: 999;
  font-size: 12px;
}

.map {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 998;
  overflow: hidden;
  overflow-y: auto;
}

.map img {
  width: 100%;
}

.left {
  width: 100%;
  height: 50vh;
  overflow: hidden;
}

.left .filters {
  height: 28%;
  background-color: rgb(191, 191, 191);
  border: 2px dashed #ff5722;
  display: flex;
  flex-flow: row wrap;
  align-content: flex-start;
  justify-content: space-around;
  padding: 0 10px;
  overflow: hidden;
  overflow-y: auto;
}

.left .filters p {
  width: 7em;
  height: 30px;
  line-height: 30px;
  text-align: center;
  flex: 0 0 33%;
  margin-top: 10px;
  background-color: #909399;
  color: #000;
  font-size: 12px;
}

.left .filters p.success {
  background-color: #03a9f4;
  color: #000;
  font-weight: bold;
}

.left #ldq {
  width: 100%;
  height: 72%;
  background-color: rgb(227 225 225);
  padding: 0 10px;
  overflow: hidden;
  overflow-y: auto;
  display: flex;
  flex-flow: row wrap;
  align-content: flex-start;
  justify-content: space-around;
}

.left #ldq p {
  position: relative;
  flex: 0 0 33%;
  width: 6em;
  height: 50px;
  line-height: 50px;
  background-color: #7e7c859e;
  margin-top: 25px;
  /* padding: 10px 20px; */
  font-size: 12px;
  text-align: center;
  color: #fff;
}

.left #ldq p.selected {
  /* background-color: #d2691e; */
  border: 2px solid #000;
}

.left #ldq p.success {
  background-color: #67c23a;
  color: #000;
}

.left #ldq p.success.selected {
  /* background-color: #308014; */
  /* color: #fff; */
}

.left #ldq p.fk {
  /* border: 2px solid rgb(238, 0, 0); */
  color: #f00;
  text-decoration: underline;
}

.lh {
  font-weight: bold;
  height: 5vh;
  font-size: 15px;
  text-align: center;
  line-height: 5vh;
  color: #f00;
}

.right {
  width: 100%;
  height: 45vh;
  padding: 20px 10px;
  overflow: hidden;
  overflow-y: auto;
  font-size: 15px;
}

.fhq {
  margin-top: 15px;
  padding: 10px;
  background-color: rgb(207 207 207 / 10%);
}

.fhq > div {
  margin-top: 3px;
}

.right #desc .lh {
  display: flex;
  justify-content: center;
}

.right #desc .lh,
.right #desc .fh,
.right #desc .tel,
.right #desc .sp .title {
  font-weight: bold;
}

.right #desc .lh span,
.right #desc .fh span,
.right #desc .tel a {
  font-weight: normal;
}

.right #desc .tel a {
  text-decoration: underline;
}

.right #desc .fh span.zt {
  font-weight: bold;
}

.sp .sp_item {
  border: 3px dashed rgb(220, 224, 153);
  margin-top: 5px;
  padding: 5px 10px;
}

.sp .sp_item.success {
  border: 2px dashed rgb(13, 185, 13);
  background: #4caf5078;
}

.sp .sp_item .sp_name span,
.sp .sp_item .sp_sl span,
.sp .sp_item .sp_zt span {
  font-weight: bold;
  color: #000;
}

.sp .sp_item .sp_zt.sp_zt.success {
  color: green;
}

.sp .sp_item .sp_zt.fail {
  color: orange;
}
</style>
<style lang="scss">
.el-message-box__wrapper {
  .el-message-box {
    width: 80%;
    padding-bottom: 18px;
    .el-message-box__headerbtn {
      font-size: 12px;
    }
    .el-message-box__content {
      font-size: 15px;
      padding: 20px 7px;
      .el-message-box__message p {
        line-height: 18px;
      }
    }
    .el-button--small {
      font-size: 15px;
    }
  }
}

.login_wrap {
  width: 80% !important;
  .el-button {
    margin-top: 20px;
    font-size: 12px;
    padding: 12px 20px;
  }
}

.el-message {
  min-width: 361px !important;
}
</style>
