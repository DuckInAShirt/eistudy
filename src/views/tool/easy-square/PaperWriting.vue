<template>
  <div class="page-wrap">
    <div class="page-hero" :style="bgStyle('paper-writing')">
      <h2>论文撰写</h2>
      <p>章节撰写、语言润色与格式规范</p>
    </div>
    <div class="page-body">
      <el-alert type="info" title="独立页面。后续可接入模板、参考文献管理、格式校验等。" :closable="false" />
      <div class="actions">
        <el-button @click="goQA">临时进入问答</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EasyPaperWriting',
  methods: {
    bgStyle(type) {
      const map = { 'paper-writing': '/img/easy-square/paper-writing.svg' }
      return {
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.45)), url('${map[type]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    goQA() { this.$router.push({ path: '/tool/dify-chat', query: { type: 'paper-writing' } }) }
  }
}
</script>

<style scoped>
.page-wrap { padding: 20px; }
.page-hero { border-radius: 12px; color: #fff; padding: 36px 20px; margin-bottom: 16px; }
.page-body { background: #fff; border-radius: 12px; padding: 16px; }
.actions { margin-top: 16px; }
</style>


