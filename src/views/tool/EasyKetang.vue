<template>
  <div class="easy-ketang-container">
    <iframe
      src="https://www.easyketang.com/"
      frameborder="0"
      class="easy-ketang-iframe"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'EasyKetang',
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
      const iframe = this.$el.querySelector('.easy-ketang-iframe');
      if (iframe) {
        const containerHeight = window.innerHeight - 84; // 减去导航栏高度
        iframe.style.height = `${containerHeight}px`;
      }
    }
  }
};
</script>

<style scoped>
.easy-ketang-container {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  background: #f5f7fa;
}

.easy-ketang-iframe {
  width: 100%;
  height: calc(100vh - 84px);
  border: none;
  display: block;
}
</style>


