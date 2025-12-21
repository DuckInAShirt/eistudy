<template>
  <div class="paper-topic-page">
    <!-- 顶部区域 -->
    <div class="hero" :style="bgStyle">
      <div class="hero-main">
        <h2>论文选题助手</h2>
        <p>根据你的专业方向和兴趣，智能生成更聚焦、更有创新性的论文选题思路。</p>
        <ul class="hero-tags">
          <li>方向梳理</li>
          <li>可行性评估</li>
          <li>创新点启发</li>
        </ul>
      </div>
      <div class="hero-side">
        <div class="hero-tip-card">
          <div class="tip-title">使用小贴士</div>
          <ul>
            <li>尽量写清楚课程 / 研究领域，比如“人工智能辅助教学”。</li>
            <li>可以带上应用场景，例如“高校线上教学平台”。</li>
            <li>如果已经有大致方向，也可以直接输入，AI 会帮你细化。</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 主体两栏布局 -->
    <div class="content">
      <!-- 左侧：条件填写表单 -->
      <div class="left-panel">
        <el-card shadow="never" class="card">
          <div slot="header" class="card-header">
            <span>填写选题需求</span>
            <span class="card-sub">填写越具体，生成的建议越贴合你的研究方向</span>
          </div>
          <el-form :model="form" label-width="90px" label-position="left" size="small" class="topic-form">
            <el-form-item label="学位/阶段">
              <el-radio-group v-model="form.degree">
                <el-radio-button label="本科"></el-radio-button>
                <el-radio-button label="硕士"></el-radio-button>
                <el-radio-button label="博士"></el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="所属专业">
              <el-input
                v-model="form.major"
                placeholder="例如：电子信息工程 / 计算机科学与技术"
                clearable
              />
            </el-form-item>

            <el-form-item label="研究方向">
              <el-input
                type="textarea"
                :rows="2"
                v-model="form.direction"
                placeholder="你大概想研究哪个方向？例如：智能问答系统在高校教学中的应用"
                clearable
              />
            </el-form-item>

            <el-form-item label="研究对象 / 场景">
              <el-input
                type="textarea"
                :rows="2"
                v-model="form.scene"
                placeholder="例如：某高校电子信息类课程、在线学习平台、实验教学场景等"
                clearable
              />
            </el-form-item>

            <el-form-item label="方法 / 技术">
              <el-input
                v-model="form.method"
                placeholder="可选填，例如：深度学习、知识图谱、数据分析、问卷调查等"
                clearable
              />
            </el-form-item>

            <el-form-item label="难度偏好">
              <el-radio-group v-model="form.difficulty">
                <el-radio-button label="适中"></el-radio-button>
                <el-radio-button label="偏实践"></el-radio-button>
                <el-radio-button label="偏理论"></el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="其他要求">
              <el-input
                type="textarea"
                :rows="2"
                v-model="form.requirement"
                placeholder="例如：希望贴近实际项目 / 便于数据采集 / 与就业方向相关等"
                clearable
              />
            </el-form-item>

            <div class="form-actions">
              <el-button type="primary" @click="goQAWithPrompt">
                生成选题问答
              </el-button>
              <el-button @click="goQAOnly">直接进入问答</el-button>
            </div>
          </el-form>
        </el-card>
      </div>

      <!-- 右侧：智能推荐 & 预览 -->
      <div class="right-panel">
        <el-card shadow="never" class="card preview-card">
          <div slot="header" class="card-header">
            <span>候选选题预览</span>
          </div>
          <div class="preview-body">
            <div class="preview-title">
              {{ previewTitle }}
            </div>
            <p class="preview-desc">
              这是根据你当前填写的信息自动生成的一条示例选题。点击左侧“生成选题问答”，AI 会基于这些条件进一步给出多条可选方案，并帮你评估可行性和创新性。
            </p>
            <ul class="preview-meta">
              <li><span>学位/阶段：</span>{{ form.degree || '未填写' }}</li>
              <li><span>所属专业：</span>{{ form.major || '未填写' }}</li>
              <li><span>研究场景：</span>{{ form.scene || '未填写' }}</li>
            </ul>
          </div>
        </el-card>

        <el-card shadow="never" class="card tips-card">
          <div slot="header" class="card-header">
            <span>常见选题方向参考</span>
          </div>
          <ul class="tip-list">
            <li v-for="(item, idx) in sampleDirections" :key="idx">
              <div class="tip-title">{{ item.title }}</div>
              <div class="tip-desc">{{ item.desc }}</div>
            </li>
          </ul>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EasyPaperTopic',
  data() {
    return {
      form: {
        degree: '本科',
        major: '',
        direction: '',
        scene: '',
        method: '',
        difficulty: '适中',
        requirement: ''
      },
      sampleDirections: [
        {
          title: 'AI 在高校教学质量诊断中的应用',
          desc: '围绕课堂互动数据、作业数据等，探索 AI 对教学质量评估与预警的支持。'
        },
        {
          title: '面向在线学习平台的学习行为分析与干预策略',
          desc: '结合日志数据与问卷调查，对学生学习行为进行建模与分层干预。'
        },
        {
          title: '基于知识图谱的电子信息课程知识点关联研究',
          desc: '构建课程知识图谱，用于学习路径推荐与错题诊断。'
        }
      ]
    };
  },
  computed: {
    bgStyle() {
      const url = '/img/easy-square/paper-topic.svg';
      return {
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,.45), rgba(0,0,0,.55)), url('${url}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    },
    previewTitle() {
      const major = this.form.major || '电子信息类';
      const direction = this.form.direction || '智能教学支持';
      const scene = this.form.scene || '高校课堂教学';
      const method = this.form.method || '数据分析与建模';
      return `基于${method}的${major}专业${scene}中${direction}研究`;
    }
  },
  methods: {
    buildPrompt() {
      return [
        `我是一名${this.form.degree || '本科'}学生，专业是${this.form.major || '电子信息类相关专业'}。`,
        this.form.direction
          ? `目前大致想研究的方向是：${this.form.direction}。`
          : '目前还没有特别明确的研究方向，希望你先帮我梳理几个合适的选题方向。',
        this.form.scene ? `主要研究对象或应用场景包括：${this.form.scene}。` : '',
        this.form.method ? `方法/技术上，优先考虑：${this.form.method}。` : '',
        `整体难度希望：${this.form.difficulty || '适中'}。`,
        this.form.requirement ? `其他要求：${this.form.requirement}。` : '',
        '请结合以上信息，给出 5-8 个中文论文题目建议，并分别说明每个题目的研究重点、创新点和可行性。'
      ]
        .filter(Boolean)
        .join('\n');
    },
    goQAOnly() {
      this.$router.push({ path: '/tool/dify-chat', query: { type: 'paper-topic' } });
    },
    goQAWithPrompt() {
      const prompt = this.buildPrompt();
      this.$router.push({
        path: '/tool/dify-chat',
        query: {
          type: 'paper-topic',
          draft: encodeURIComponent(prompt)
        }
      });
    }
  }
};
</script>

<style scoped>
.paper-topic-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.hero {
  display: grid;
  grid-template-columns: 2fr 1.2fr;
  gap: 20px;
  padding: 26px 24px;
  border-radius: 16px;
  color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 14px 45px rgba(0, 0, 0, 0.25);
}

.hero-main h2 {
  font-size: 26px;
  margin-bottom: 8px;
}

.hero-main p {
  font-size: 14px;
  opacity: 0.9;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  padding: 0;
  list-style: none;
}

.hero-tags li {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.hero-side {
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

.hero-tip-card {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 14px 16px;
  backdrop-filter: blur(8px);
  width: 100%;
  max-width: 320px;
}

.hero-tip-card .tip-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.hero-tip-card ul {
  padding-left: 16px;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}

.content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
}

.card {
  border-radius: 14px;
}

.card-header {
  display: flex;
  flex-direction: column;
}

.card-header span:first-child {
  font-weight: 600;
}

.card-sub {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.topic-form {
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.preview-card .preview-body {
  font-size: 13px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #303133;
}

.preview-desc {
  color: #606266;
  margin-bottom: 10px;
}

.preview-meta {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.preview-meta li span {
  color: #606266;
}

.tip-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
}

.tip-list li + li {
  margin-top: 10px;
}

.tip-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.tip-desc {
  color: #909399;
}

@media (max-width: 992px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-side {
    justify-content: flex-start;
  }

  .content {
    grid-template-columns: 1fr;
  }
}
</style>
