<template>
  <div class="page-wrap">
    <div class="page-hero" :style="bgStyle('job-info')">
      <h2>招聘信息</h2>
      <p>岗位趋势、行业方向与投递建议</p>
    </div>
    <div class="page-body">
      <el-alert type="info" title="独立页面。后续可展示招聘流、RSS、订阅等。" :closable="false" />
      <div class="actions">
        <el-button @click="goQA">临时进入问答</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EasyJobInfo',
  methods: {
    bgStyle(type) {
      const map = { 'job-info': '/img/easy-square/job-info.svg' }
      return {
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.45)), url('${map[type]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    goQA() { this.$router.push({ path: '/tool/dify-chat', query: { type: 'job-info' } }) }
  }
}
</script>

<style scoped>
.page-wrap { padding: 20px; }
.page-hero { border-radius: 12px; color: #fff; padding: 36px 20px; margin-bottom: 16px; }
.page-body { background: #fff; border-radius: 12px; padding: 16px; }
.actions { margin-top: 16px; }
</style>


