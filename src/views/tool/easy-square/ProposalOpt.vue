<template>
  <div class="page-wrap">
    <div class="page-hero" :style="bgStyle('proposal-opt')">
      <h2>开题报告优化</h2>
      <p>结构优化、研究方法与文献综述建议</p>
    </div>
    <div class="page-body">
      <el-alert type="info" title="独立页面。后续可接入提纲生成、规范校验等。" :closable="false" />
      <div class="actions">
        <el-button @click="goQA">临时进入问答</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EasyProposalOpt',
  methods: {
    bgStyle(type) {
      const map = { 'proposal-opt': '/img/easy-square/proposal-opt.svg' }
      return {
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.45)), url('${map[type]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    goQA() { this.$router.push({ path: '/tool/dify-chat', query: { type: 'proposal-opt' } }) }
  }
}
</script>

<style scoped>
.page-wrap { padding: 20px; }
.page-hero { border-radius: 12px; color: #fff; padding: 36px 20px; margin-bottom: 16px; }
.page-body { background: #fff; border-radius: 12px; padding: 16px; }
.actions { margin-top: 16px; }
</style>


