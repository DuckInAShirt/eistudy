<template>
  <div class="page-wrap">
    <div class="page-hero" :style="bgStyle('admission')">
      <h2>招生咨询</h2>
      <p>招生政策、报考流程与注意事项</p>
    </div>
    <div class="page-body">
      <el-alert type="info" title="这是独立页面。后续可接入问答或 workflow。" :closable="false" />
      <div class="actions">
        <el-button type="primary" @click="goQA">进入智能问答</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EasyAdmission',
  methods: {
    bgStyle(type) {
      const map = {
        'admission': '/img/easy-square/admission.svg'
      }
      return {
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.45)), url('${map[type]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    goQA() {
      this.$router.push({ path: '/tool/dify-chat', query: { type: 'admission' } })
    }
  }
}
</script>

<style scoped>
.page-wrap { padding: 20px; }
.page-hero {
  border-radius: 12px; color: #fff; padding: 36px 20px; margin-bottom: 16px;
}
.page-hero h2 { margin: 0 0 8px 0; font-weight: 600; }
.page-body { background: #fff; border-radius: 12px; padding: 16px; }
.actions { margin-top: 16px; }
</style>


