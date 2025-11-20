<template>
  <div class="smart-qa-container">
    <div class="page-header">
      <h2>智能测试</h2>
      <p>选择您想要进行的测试类型</p>
    </div>
    <div class="card-list">
      <div
        v-for="item in cards"
        :key="item.type"
        class="qa-card"
        @click="handleCardClick(item)"
      >
        <div class="card-icon">
          <i :class="item.icon"></i>
        </div>
        <div class="card-content">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-desc">{{ item.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmartTest',
  data() {
    return {
      cards: [
        { 
          title: '电子信息课程综合测试', 
          type: 'main',
          description: '涵盖电子信息类各专业课程的综合能力测试',
          icon: 'el-icon-cpu'
        },
        { 
          title: '电路分析基础测试', 
          type: 'circuit',
          description: '电路理论、分析方法、定理应用等专项测试',
          icon: 'el-icon-connection'
        },
        { 
          title: '电子电路基础测试', 
          type: 'ecircuit',
          description: '模拟电路、数字电路基础知识专项测试',
          icon: 'el-icon-cpu'
        },
        { 
          title: '信号与系统测试', 
          type: 'signal',
          description: '信号处理、系统分析、傅里叶变换等专项测试',
          icon: 'el-icon-data-analysis'
        },
        { 
          title: '电磁场微波技术测试', 
          type: 'microwave',
          description: '电磁场理论、微波器件、天线技术专项测试',
          icon: 'el-icon-wifi'
        },
        { 
          title: '通信原理测试', 
          type: 'communication',
          description: '通信系统、调制解调、编码技术专项测试',
          icon: 'el-icon-phone'
        },
        { 
          title: '数字信号处理测试', 
          type: 'dsp',
          description: '数字滤波、FFT、数字信号处理算法专项测试',
          icon: 'el-icon-data-line'
        },
        { 
          title: '微电子技术测试', 
          type: 'microelectronics',
          description: '半导体物理、集成电路设计专项测试',
          icon: 'el-icon-microchip'
        }
      ]
    }
  },
  methods: {
    handleCardClick(item) {
      if (item.type === 'circuit') {
        // 跳转到电路分析知识点拓扑图页面
        this.$router.push('/tool/circuit-topology');
      } else {
        // 其他课程暂时显示开发中提示
        this.$message.info('该功能正在开发中，敬请期待！');
      }
    }
  }
}
</script>

<style scoped>
.smart-qa-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;
}

.page-header h2 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 10px;
  font-weight: 600;
}

.page-header p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.qa-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #b3e5fc 100%);
  color: #206080;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(32, 96, 128, 0.10);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  min-height: 120px;
  position: relative;
  overflow: hidden;
}

.qa-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.qa-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(32, 96, 128, 0.18);
  background: linear-gradient(135deg, #b3e5fc 0%, #e1f5fe 100%);
}

.qa-card:hover::before {
  opacity: 1;
}

.card-icon {
  font-size: 32px;
  margin-right: 20px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.card-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.3;
}

.card-desc {
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-list {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 10px;
  }
  
  .qa-card {
    padding: 20px;
    min-height: 100px;
  }
  
  .card-title {
    font-size: 18px;
  }
  
  .card-desc {
    font-size: 13px;
  }
  
  .card-icon {
    font-size: 28px;
    margin-right: 16px;
  }
}

@media (max-width: 480px) {
  .smart-qa-container {
    padding: 15px;
  }
  
  .page-header h2 {
    font-size: 24px;
  }
  
  .page-header p {
    font-size: 14px;
  }
}
</style> 