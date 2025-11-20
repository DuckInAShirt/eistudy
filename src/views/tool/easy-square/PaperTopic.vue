<template>
  <div class="page-wrap">
    <div class="page-hero" :style="bgStyle('paper-topic')">
      <h2>论文选题</h2>
      <p>方向启发、可行性评估与创新点建议</p>
    </div>
    <div class="page-body">
      <el-alert type="info" title="独立页面。后续可接入知识库检索、选题库等。" :closable="false" />
      <div class="actions">
        <el-button @click="goQA">临时进入问答</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EasyPaperTopic',
  methods: {
    bgStyle(type) {
      const map = { 'paper-topic': '/img/easy-square/paper-topic.svg' }
      return {
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.45)), url('${map[type]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    goQA() { this.$router.push({ path: '/tool/dify-chat', query: { type: 'paper-topic' } }) }
  }
}
</script>

<style scoped>
.page-wrap { padding: 20px; }
.page-hero { border-radius: 12px; color: #fff; padding: 36px 20px; margin-bottom: 16px; }
.page-body { background: #fff; border-radius: 12px; padding: 16px; }
.actions { margin-top: 16px; }
</style>


