<template>
  <div class="wrapper">
    <el-dialog
      title="请输入用户名"
      :visible.sync="isNLogin"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      custom-class="login_wrap"
    >
      <el-input type="text" v-model="token"></el-input>
      <el-button type="primary" @click="toLogin">确定登录</el-button>
    </el-dialog>
    <div class="map_btn" @click="getMap">查看地图</div>
    <div class="map_btn intro_btn" @click="getIntro()">查看说明</div>
    <!-- 上部分 -->
    <div class="left">
      <div class="filters">
        <p
          :class="{
            selected: search.includes(item.sp_id),
            success: item.count_completed == item.count,
          }"
          @click="goSearch(item.sp_id)"
          :key="index"
          v-for="(item, index) of searchList"
        >
          {{ item.name.split('(')[0] }}（{{ item.count_completed }}/{{
            item.count
          }}）
        </p>
      </div>
      <div id="ldq" v-if="ldList.length">
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
      <div id="ldq" v-else>
        <p class="tip">勾选上方商品进行查询</p>
      </div>
    </div>
    <!-- 下部分 -->
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
              <p class="sp_name" v-if="sp.bz"><span>备注：</span>{{ sp.bz }}</p>
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
import 'viewerjs/dist/viewer.css';
import VueViewer from 'v-viewer';
import img_intro1 from '@/utils/assets/intro1.jpg';
import img_intro2 from '@/utils/assets/intro2.jpg';
import img_map from '@/utils/assets/map.jpg';
import Vue from 'vue';

Vue.use(VueViewer);

export default {
  data() {
    return {
      uuid: null,
      introList: [
        {
          url: img_intro1,
          title: 'intro1',
        },
        {
          url: img_intro2,
          title: 'intro2',
        },
      ],
      mapList: [img_map],
      curMap: 0,
      gid: null,
      isNLogin: false,
      token: '',
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
      const { fhq } = data;
      let total = 0;
      for (let i = 0; i < fhq.length; ++i) {
        for (let j = 0; j < fhq[i].sp.length; ++j) {
          total += fhq[i].sp[j].zt == 1 ? fhq[i].sp[j].count : 0;
        }
      }
      return total;
    },
    getTotalByLd(data) {
      const { fhq } = data;
      let total = 0;
      for (let i = 0; i < fhq.length; ++i) {
        for (let j = 0; j < fhq[i].sp.length; ++j) {
          total += fhq[i].sp[j].count;
        }
      }
      return total;
    },
    getMap() {
      this.$viewerApi({
        images: this.mapList,
      });
    },
    getIntro() {
      this.$viewerApi({
        options: {
          toolbar: true,
          url: 'url',
          initialViewIndex: 1,
        },
        images: this.introList,
      });
    },
    ldIsSccess(ld) {
      return ld.fhq.every((item) => {
        return item.sp.every((itm) => {
          if (this.search.includes(itm.sp_id)) {
            return itm.zt == 1;
          } else {
            return true;
          }
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
            zt,
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
      this.$message.success('登录成功');
      this.isNLogin = false;
      localStorage.setItem('token', this.token);
    },
    copy(text) {
      copy(text);
      this.$message.success('拷贝成功');
    },
    // safariHacks() {
    //   let windowsVH = window.innerHeight / 100;
    //   document
    //     .querySelector('.wrapper')
    //     .style.setProperty('--vh', windowsVH + 'px');
    //   window.addEventListener('resize', function () {
    //     document
    //       .querySelector('.wrapper')
    //       .style.setProperty('--vh', windowsVH + 'px');
    //   });
    // },
  },
  async mounted() {
    // this.safariHacks();
    this.uuid = this.$route.query.uuid;
    if (!this.uuid) {
      this.$message.error('链接不正确');
      return;
    } else {
      try {
        await Axios.get(`/groupon_uuid?uuid=${this.uuid}`)
          .then((res) => {
            this.gid = res.data.data.id;
          })
          .catch((err) => {
            throw new Error();
          });
      } catch (err) {
        console.log(err);
        this.$message.error('链接不正确');
        return;
      }
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

.wrapper {
  position: fixed;
  width: 100vw;
  height: 100vh;
  // height: calc(var(--vh, 1vh) * 100);
  top: 0;
  left: 0;
  overflow: hidden;
}

.map_btn {
  position: fixed;
  width: 60px;
  height: 60px;
  top: 50%;
  right: 15px;
  background-color: orange;
  border-radius: 50%;
  text-align: center;
  line-height: 60px;
  z-index: 997;
  font-size: 12px;
}

.map_btn.intro_btn {
  z-index: 999;
  top: 60%;
}

.map {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 996;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.intro {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
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
  min-height: 30px;
  line-height: 30px;
  text-align: center;
  flex: 0 0 33%;
  margin-top: 10px;
  background-color: #909399;
  color: #000;
  font-size: 12px;
}

.left .filters p.selected {
  background-color: #03a9f4;
  color: #000;
  font-weight: bold;
}

.left .filters p.success.selected {
  background-color: #67c23a;
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

.left #ldq p.tip {
  background-color: unset;
  font-size: 30px;
  width: 80vw;
  color: #999;
  flex: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-top: -20px;
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
