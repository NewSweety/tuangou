<template>
  <div class="wrapper" v-loading="loading">
    <el-dialog
      title="团购链接"
      :visible.sync="isDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      导入成功，您的团购链接为，<span style="color: red; font-weight: bold"
        >请牢记此链接</span
      >，点击复制：<el-link type="primary" @click="toCopy(linkNew)">{{
        linkNew
      }}</el-link>
    </el-dialog>
    <!-- 新增 -->
    <!-- <el-input type="text" v-model=""></el-input> -->
    <div class="box import">
      <h3>新增批次</h3>
      <el-upload
        drag
        :on-change="handleChange"
        :on-exceed="handleExceed"
        :auto-upload="false"
        :multiple="false"
        :limit="1"
        action=""
        ref="upload"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传xlsx文件</div>
      </el-upload>
      <el-button class="btn" type="primary" @click="upload">确认上传</el-button>
    </div>
    <!-- 模板 -->
    <div class="box add">
      <h4>导入说明</h4>
      <p class="el-upload__tip">
        请按照模板导入订单，目前支持快团团订单无缝对接，其他订单请团长手动处理好Excel。
        该系统目前测试阶段，请自行核对数量和准确性。
        如有订单错误，系统异常等情况会尽快处理，但不承担任何责任。
      </p>
      <el-link type="primary" target="_blank" :href="templateHref"
        >下载模板</el-link
      >
    </div>
  </div>
</template>
<script>
import Axios from '@/utils/axios';
import { copy } from 'mini-toolkit';
import { saveAs } from 'file-saver';

export default {
  data() {
    return {
      isDialog: false,
      linkNew: '',
      file: null,
      loading: false,
      isUpload: false,
      templateHref: window.document.location.origin + '/upload/template.xlsx',
    };
  },
  methods: {
    toCopy(text) {
      copy(text);
      this.$message.success('拷贝成功');
    },
    handleChange(file) {
      let suffix = file.name.replace(/.+\./, '');
      if (suffix != 'xlsx') {
        this.$message.error('上传文件只支持xlsx格式');
        this.$refs.upload.clearFiles();
        return;
      }
      this.file = file;
    },
    handleExceed() {
      this.$message.error(`最多上传1个文件`);
    },
    upload() {
      if (!this.file) {
        this.$message.error('请上传文件');
        return;
      }
      this.$confirm('确认新增该团购批次?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.submit();
      });
    },
    // 提交
    async submit() {
      this.loading = true;
      let param = new FormData();
      param.append('file', this.file.raw);
      Axios({
        url: '/groupon_file',
        method: 'post',
        data: param,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(res => {
          this.linkNew = `${window.document.location.origin}?uuid=${res.data.data.uuid}`;
          this.toCopy(this.linkNew);
          this.isDialog = true;
          this.loading = false;
          this.$refs.upload.clearFiles();
          this.file = null;
        })
        .catch(err => {
          this.loading = false;
          this.$message.error(err.response.data.responseDesc);
        });
    },
  },
  mounted() {
    console.log();
  },
};
</script>
<style lang="scss" scoped>
.wrapper {
  padding: 30px;
  .box {
    border: 2px dashed orange;
    margin-bottom: 20px;
    padding: 10px;
    max-width: 750px;
    width: 100%;
    .btn {
      margin-top: 10px;
    }
  }
}
</style>
