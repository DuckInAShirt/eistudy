<template>
  <div class="circuit-test-container">
    <div class="test-header">
      <el-button icon="el-icon-arrow-left" type="text" @click="goBack">返回</el-button>
      <h2>{{ knowledgeTitle }} - 单选题测试</h2>
    </div>
    <div v-if="question" class="test-content">
      <div class="question-image">
        <el-image
          :src="question.image"
          :preview-src-list="[question.image]"
          fit="contain"
          class="question-img"
        />
      </div>
      <el-radio-group v-model="selected" class="options-group" :disabled="submitted">
        <el-radio label="A">
          <template v-if="question.options">A. {{ question.options.A }}</template>
          <template v-else>A</template>
        </el-radio>
        <el-radio label="B">
          <template v-if="question.options">B. {{ question.options.B }}</template>
          <template v-else>B</template>
        </el-radio>
        <el-radio label="C">
          <template v-if="question.options">C. {{ question.options.C }}</template>
          <template v-else>C</template>
        </el-radio>
        <el-radio label="D">
          <template v-if="question.options">D. {{ question.options.D }}</template>
          <template v-else>D</template>
        </el-radio>
      </el-radio-group>
      <div class="test-actions">
        <el-button type="primary" :disabled="!selected || submitted" @click="submit">提交</el-button>
        <el-button @click="goBack">返回拓扑图</el-button>
        <el-button v-if="submitted" @click="redo" type="warning">重新作答</el-button>
      </div>
      <div v-if="submitted" class="result-section">
        <div v-if="selected === question.answer" class="result-correct">
          <i class="el-icon-success"></i> 恭喜，答对了！
        </div>
        <div v-else class="result-wrong">
          <i class="el-icon-error"></i> 很遗憾，正确答案是 {{ question.answer }}
        </div>
      </div>
    </div>
    <div v-else class="no-question">暂无该知识点的测试题</div>
  </div>
</template>

<script>
export default {
  name: 'CircuitTest',
  data() {
    return {
      selected: '',
      submitted: false,
      knowledgeTitle: '',
      question: null,
      questions: {
        '01': {
          image: require('@/assets/circuit/questions/TXT00191.png'),
          answer: 'A'
        },
        '02': {
          image: require('@/assets/circuit/questions/TXT00001.png'),
          answer: 'B'
        },
        '03': {
          image: require('@/assets/circuit/questions/TXT00061.png'),
          answer: 'A'
        },
        '04': {
          image: require('@/assets/circuit/questions/TXT00052.png'),
          answer: 'D',
          options: {
            'A': '电阻吸收功率, 电压源与电流源供出功率',
            'B': '电阻与电压源吸收功率, 电流源供出功率',
            'C': '电阻与电流源吸收功率, 电压源供出功率',
            'D': '电阻吸收功率, 电流源供出功率，电压源无法确定'
          }
        }
        // ... 继续补充其他知识点题目
      }
    }
  },
  created() {
    const id = this.$route.params.id;
    this.knowledgeTitle = this.getKnowledgeTitle(id);
    this.question = this.questions[id] || null;
  },
  methods: {
    goBack() {
      this.$router.push('/tool/circuit-topology');
    },
    submit() {
      this.submitted = true;
      // this.selected = ''; // 不再清空，保证结果判断正确
    },
    redo() {
      this.selected = '';
      this.submitted = false;
    },
    getKnowledgeTitle(id) {
      const map = {
        '01': '集总参数电路模型',
        '02': '电路的基本变量，基尔霍夫电压定律、基尔霍夫电流定律',
        '03': '基尔霍夫定律',
        '04': '电阻电路分析',
        '05': '电路等效变换',
        '06': '网孔分析法',
        '07': '节点分析法',
        '08': '叠加定理',
        '09': '戴维南定理'
      };
      return map[id] || '未知知识点';
    }
  }
}
</script>

<style scoped>
.circuit-test-container {
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 32px 24px;
}
.test-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.test-header h2 {
  flex: 1;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}
.question-image {
  text-align: center;
  margin-bottom: 24px;
}
.question-img {
  max-width: 420px;
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  display: inline-block;
}
.options-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}
.test-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.result-section {
  margin-top: 16px;
  font-size: 16px;
}
.result-correct {
  color: #67c23a;
  margin-bottom: 8px;
}
.result-wrong {
  color: #f56c6c;
  margin-bottom: 8px;
}
.no-question {
  text-align: center;
  color: #909399;
  font-size: 18px;
  padding: 60px 0;
}
</style> 