<template>
  <div class="ilab-x-container">
    <iframe
      src="https://www.ilab-x.com/details/page?id=6480"
      frameborder="0"
      class="ilab-x-iframe"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'ILabX',
  mounted() {
    // 监听窗口大小变化，调整 iframe 高度
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      // iframe 会自动适应容器高度
      const iframe = this.$el.querySelector('.ilab-x-iframe');
      if (iframe) {
        const containerHeight = window.innerHeight - 84; // 减去导航栏高度
        iframe.style.height = `${containerHeight}px`;
      }
    }
  }
};
</script>

<style scoped>
.ilab-x-container {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  background: #f5f7fa;
}

.ilab-x-iframe {
  width: 100%;
  height: calc(100vh - 84px);
  border: none;
  display: block;
}
</style>


