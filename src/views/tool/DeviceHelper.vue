<template>
  <div class="device-helper-container">
    <iframe
      src="https://mbd.baidu.com/ma/s/UK6eAqbl"
      frameborder="0"
      class="device-helper-iframe"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'DeviceHelper',
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
      const iframe = this.$el.querySelector('.device-helper-iframe');
      if (iframe) {
        const containerHeight = window.innerHeight - 84; // 减去导航栏高度
        iframe.style.height = `${containerHeight}px`;
      }
    }
  }
};
</script>

<style scoped>
.device-helper-container {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  background: #f5f7fa;
}

.device-helper-iframe {
  width: 100%;
  height: calc(100vh - 84px);
  border: none;
  display: block;
}
</style>



