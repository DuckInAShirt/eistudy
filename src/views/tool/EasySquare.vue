<template>
  <div class="easy-square-container">
    <div class="banner-wrap" v-if="bannerSrc">
      <img class="banner-img" :src="bannerSrc" alt="易学广场横幅" />
    </div>
    <!--     
      <div class="page-header">
        <h2>易学广场</h2>
        <p>按主题进入相应频道，获取 AI 智能辅助</p>
      </div>
     -->
    <div class="section">
      <div class="section-title">学生事务问答</div>
      <div class="card-list">
        <div class="qa-card" @click="goChat('admission')">
          <div class="card-top" :style="cardImageStyle('admission')"></div>
          <div class="card-bottom">
            <div class="card-title">招生咨询</div>
            <div class="card-desc">招生政策、报考流程与注意事项智能问答</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">就业频道</div>
      <div class="card-list">
        <div class="qa-card" @click="goChat('job-info')">
          <div class="card-top" :style="cardImageStyle('job-info')"></div>
          <div class="card-bottom">
            <div class="card-title">招聘信息</div>
            <div class="card-desc">岗位方向、投递建议与招聘趋势</div>
          </div>
        </div>
        <div class="qa-card" @click="goChat('resume-opt')">
          <div class="card-top" :style="cardImageStyle('resume-opt')"></div>
          <div class="card-bottom">
            <div class="card-title">简历优化</div>
            <div class="card-desc">简历诊断与修改建议、要点提炼</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">论文频道</div>
      <div class="card-list">
        <div class="qa-card" @click="goChat('paper-topic')">
          <div class="card-top" :style="cardImageStyle('paper-topic')"></div>
          <div class="card-bottom">
            <div class="card-title">选题</div>
            <div class="card-desc">研究方向启发、可行性与创新点建议</div>
          </div>
        </div>
        <div class="qa-card" @click="goChat('proposal-opt')">
          <div class="card-top" :style="cardImageStyle('proposal-opt')"></div>
          <div class="card-bottom">
            <div class="card-title">开题报告优化</div>
            <div class="card-desc">结构优化、研究方法与文献综述建议</div>
          </div>
        </div>
        <div class="qa-card" @click="goChat('paper-writing')">
          <div class="card-top" :style="cardImageStyle('paper-writing')"></div>
          <div class="card-bottom">
            <div class="card-title">论文撰写</div>
            <div class="card-desc">章节撰写、语言润色与格式规范</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
export default {
  name: 'EasySquare',
  data() {
    return {
      // 顶部横幅图片（将图片放到 public/img/easy-square/ 并修改为你的文件名）
      bannerSrc: '/img/easy-square/banner.png',
      // 将图片放在 ruoyi-ui/public/img/easy-square/ 下即可生效
      bgMap: {
        'admission': '/img/easy-square/admission_PhotoGrid.png',
        'job-info': '/img/easy-square/job-info_PhotoGrid.png',
        'resume-opt': '/img/easy-square/resume-opt_PhotoGrid.png',
        'paper-topic': '/img/easy-square/paper-topic_PhotoGrid.png',
        'proposal-opt': '/img/easy-square/proposal-opt_PhotoGrid.png',
        'paper-writing': '/img/easy-square/paper-writing_PhotoGrid.png'
      } 
    }
  },
  methods: {
    cardImageStyle(type) {
      const url = this.bgMap[type]
      if (!url) return {}
      return {
        backgroundImage: `url('${url}')`,
        backgroundSize: '50%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    },
    goChat(type) {
      const routeMap = {
        'admission': '/tool/easy-square/admission',
        'job-info': '/tool/easy-square/job-info',
        'resume-opt': '/tool/easy-square/resume-opt',
        'paper-topic': '/tool/easy-square/paper-topic',
        'proposal-opt': '/tool/easy-square/proposal-opt',
        'paper-writing': '/tool/easy-square/paper-writing'
      }
      const path = routeMap[type] || '/tool/easy-square'
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
.easy-square-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.banner-wrap {
  max-width: 1200px;
  margin: 0 auto 16px auto;
}
.banner-img {
  width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
  aspect-ratio: 16 / 5;
  object-fit: cover;
  background: #eaf2ff;
}

.page-header {
  text-align: center;
  margin-bottom: 28px;
  padding: 10px 0 0 0;
}

.page-header h2 {
  font-size: 34px;
  color: #303133;
  margin-bottom: 6px;
  font-weight: 600;
}

.page-header p {
  font-size: 15px;
  color: #606266;
  margin: 0;
}

.section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 20px;
  color: #2c405a;
  font-weight: 700;
  margin: 14px 0 16px 0;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  justify-content: center;
}

.qa-card {
  background: #f0f9f4;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform .25s ease, box-shadow .25s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 400px;
  border: 1px solid rgba(0,0,0,0.06);
}

.qa-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.card-top {
  width: 100%;
  aspect-ratio: 2 / 1;
  background-color: #f0f9f4;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-bottom {
  padding: 20px;
  background: #f0f9f4;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #303133;
  line-height: 1.4;
}

.card-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>

