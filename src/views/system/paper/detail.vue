<template>
  <div class="app-container">
    <!-- 试卷基本信息部分保持不变 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>试卷详情</span>
<!--        <el-button style="float: right; padding: 3px 0" type="text" @click="goBack">返回列表</el-button>-->
      </div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="试卷标题">{{ paperInfo.title }}</el-descriptions-item>
        <el-descriptions-item label="总分">{{ paperInfo.totalScore }}</el-descriptions-item>
        <el-descriptions-item label="考试时长">{{ paperInfo.duration }} 分钟</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ parseTime(paperInfo.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="截止时间">{{ parseTime(paperInfo.endTime) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText[paperInfo.status] || '未知' }}</el-descriptions-item>
<!--        <el-descriptions-item label="试卷描述" :span="3">{{ paperInfo.description }}</el-descriptions-item>-->
      </el-descriptions>
    </el-card>

    <!-- 题目列表 -->
    <el-card class="box-card question-list" v-loading="loading">
      <div slot="header" class="clearfix">
        <span>题目列表</span>
        <el-button style="float: right;" size="small" type="success" @click="printPaper">打印试卷</el-button>
      </div>

      <div v-for="(question, index) in questionList" :key="question.id" class="question-item">
        <div class="question-header">
          <span class="question-number">{{ question.questionNumber }}. </span>
          <span class="question-type">[{{ questionTypes[question.questionType] || question.questionType }}]</span>
          <span class="question-score">({{ question.score }}分)</span>
          <span class="knowledge-point" v-if="question.knowledgePoint">知识点: {{ question.knowledgePoint }}</span>
        </div>

        <div class="question-content" v-html="question.questionContent"></div>

        <!-- 选择题选项 -->
        <div class="question-options" v-if="['single', 'multiple'].includes(question.questionType)">
          <div v-for="(option, key) in parseOptions(question.options)" :key="key" class="option-item">
            <span class="option-label">{{ key }}. </span>
            <code class="html-tag" v-if="isHtmlTag(option)">{{ option }}</code>
            <span v-else>{{ option }}</span>
          </div>
        </div>

        <!-- 答案区域 -->
        <div class="answer-section">
          <el-button type="text" @click="toggleAnswer(index)">
            {{ showAnswers[index] ? '隐藏答案' : '查看答案' }}
          </el-button>

          <div v-if="showAnswers[index]" class="answer-content">
            <el-divider content-position="left">参考答案</el-divider>
            <!-- 填空题答案 -->
            <template v-if="question.questionType === 'fill'">
              <div v-for="answer in getAnswersForQuestion(question.id)" :key="answer.id" class="blank-answer">
                <span>空格{{ answer.blankNumber }}({{ answer.blankScore }}分): </span>
                <code class="html-tag" v-if="isHtmlTag(answer.answerContent)">{{ answer.answerContent }}</code>
                <span v-else>{{ answer.answerContent }}</span>
              </div>
            </template>
            <!-- 其他题型答案 -->
            <template v-else>
              <div v-if="getAnswersForQuestion(question.id).length > 0">
                <code class="html-tag" v-if="isHtmlTag(getAnswersForQuestion(question.id)[0].answerContent)">
                  {{ getAnswersForQuestion(question.id)[0].answerContent }}
                </code>
                <span v-else>{{ getAnswersForQuestion(question.id)[0].answerContent }}</span>
              </div>
              <div v-else class="no-answer">暂无参考答案</div>
            </template>

            <!-- 题目解析 -->
            <template v-if="question.analysis">
              <el-divider content-position="left">解析</el-divider>
              <div v-if="containsHtmlTags(question.analysis)" class="analysis-content">
                {{ formatAnalysisWithTags(question.analysis) }}
              </div>
              <div v-else>{{ question.analysis }}</div>
            </template>

            <!-- 评分标准 -->
            <template v-if="question.scoringCriteria && ['essay', 'coding'].includes(question.questionType)">
              <el-divider content-position="left">评分标准</el-divider>
              <div>{{ question.scoringCriteria }}</div>
            </template>
          </div>
        </div>
      </div>

      <!-- 无数据提示 -->
      <el-empty v-if="questionList.length === 0" description="暂无题目"></el-empty>
    </el-card>
  </div>
</template>

<script>
import { getPaper } from "@/api/system/paper";
import { listQuestion } from "@/api/system/question";
import { listAnswer } from "@/api/system/answer";

export default {
  name: "PaperDetail",
  data() {
    return {
      // 原有数据保持不变
      paperId: null,
      paperInfo: {},
      questionList: [],
      answerList: [],
      showAnswers: {},
      loading: true,
      questionTypes: {
        single: '单选题',
        multiple: '多选题',
        fill: '填空题',
        essay: '简答题',
        coding: '编程题'
      },
      statusText: {
        0: '未开始',
        1: '进行中',
        2: '已结束'
      }
    };
  },
  created() {
    this.paperId = this.$route.params.id;
    this.loadData();
  },
  methods: {
    // 原有方法保持不变
    loadData() {
      this.loading = true;
      Promise.all([
        this.getPaperInfo(),
        this.getQuestionList(),
        this.getAnswerList()
      ]).finally(() => {
        this.loading = false;
      });
    },
    getPaperInfo() {
      return getPaper(this.paperId).then(response => {
        this.paperInfo = response.data || {};
      });
    },
    getQuestionList() {
      return listQuestion({
        paperId: this.paperId,
        pageSize: 100
      }).then(response => {
        this.questionList = (response.rows || [])
          .sort((a, b) => a.questionNumber - b.questionNumber);
        this.questionList.forEach((_, index) => {
          this.$set(this.showAnswers, index, false);
        });
      });
    },
    getAnswerList() {
      return listAnswer({ pageSize: 1000 }).then(response => {
        this.answerList = response.rows || [];
      });
    },
    toggleAnswer(index) {
      this.$set(this.showAnswers, index, !this.showAnswers[index]);
    },
    getAnswersForQuestion(questionId) {
      return this.answerList.filter(answer => answer.questionId === questionId);
    },
    parseOptions(optionsStr) {
      try {
        return JSON.parse(optionsStr || '{}');
      } catch (e) {
        console.error('解析选项失败', e);
        return {};
      }
    },
    // goBack() {
    //   this.$router.go(-1); // 返回上一页，更可靠的方式
    // },

    // 新增的方法
    /** 检查字符串是否为HTML标签 */
    isHtmlTag(text) {
      if (!text) return false;
      return /^<[a-zA-Z][a-zA-Z0-9]*>$/.test(text);
    },

    /** 检查文本中是否包含HTML标签 */
    containsHtmlTags(text) {
      if (!text) return false;
      return /<[a-zA-Z][a-zA-Z0-9]*>/.test(text);
    },

    /** 格式化包含HTML标签的解析文本 */
    formatAnalysisWithTags(text) {
      if (!text) return '';

      // 替换HTML标签为带格式的文本
      return text.replace(/<([a-zA-Z][a-zA-Z0-9]*)>/g, (match, tag) => {
        return `<${tag}>`;
      });
    },

    /** 打印试卷 */
    printPaper() {
      this.$modal.confirm('是否包含答案和解析？').then(() => {
        this.doPrint(true);
      }).catch(() => {
        this.doPrint(false);
      });
    },

    /** 执行打印 */
    doPrint(withAnswers) {
      let printWindow = window.open('', '_blank');
      let content = `
        <html>
        <head>
          <title>${this.paperInfo.title || '试卷详情'}</title>
          <style>
            body { font-family: SimSun, serif; padding: 20px; }
            .paper-header { text-align: center; margin-bottom: 20px; }
            .paper-title { font-size: 22px; font-weight: bold; }
            .paper-info { margin-top: 10px; font-size: 14px; }
            .question-item { margin-bottom: 20px; }
            .question-header { font-weight: bold; }
            .option-item { margin: 5px 0; padding-left: 20px; }
            .html-tag { font-family: monospace; background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
            .answer { color: #67C23A; margin-top: 10px; }
            @media print {
              .no-print { display: none; }
              body { font-size: 12pt; }
            }
          </style>
        </head>
        <body>
          <div class="paper-header">
            <div class="paper-title">${this.paperInfo.title || '试卷'}</div>
            <div class="paper-info">
              总分: ${this.paperInfo.totalScore || 0}分 |
              考试时长: ${this.paperInfo.duration || 0}分钟
            </div>
            <div class="paper-info">
              ${this.paperInfo.description || ''}
            </div>
          </div>
          <div class="no-print">
            <button onclick="window.print()">打印</button>
            <button onclick="window.close()">关闭</button>
          </div>
      `;

      // 添加题目内容
      this.questionList.forEach(question => {
        content += `
          <div class="question-item">
            <div class="question-header">
              ${question.questionNumber}. [${this.questionTypes[question.questionType] || question.questionType}] (${question.score}分)
            </div>
            <div>${question.questionContent || ''}</div>
        `;

        // 选择题选项
        if (['single', 'multiple'].includes(question.questionType)) {
          const options = this.parseOptions(question.options);
          for (const key in options) {
            const optionText = this.isHtmlTag(options[key]) ?
              `<span class="html-tag">${options[key]}</span>` : options[key];
            content += `<div class="option-item">${key}. ${optionText}</div>`;
          }
        }

        // 如果需要显示答案
        if (withAnswers) {
          const answers = this.getAnswersForQuestion(question.id);
          if (answers.length > 0) {
            content += `<div class="answer"><strong>参考答案:</strong>`;

            if (question.questionType === 'fill') {
              answers.forEach(answer => {
                const answerText = this.isHtmlTag(answer.answerContent) ?
                  `<span class="html-tag">${answer.answerContent}</span>` : answer.answerContent;
                content += `<div>空格${answer.blankNumber}: ${answerText}</div>`;
              });
            } else {
              const answerText = this.isHtmlTag(answers[0].answerContent) ?
                `<span class="html-tag">${answers[0].answerContent}</span>` : answers[0].answerContent;
              content += `<div>${answerText}</div>`;
            }

            content += `</div>`;

            if (question.analysis) {
              content += `<div class="answer"><strong>解析:</strong> ${question.analysis}</div>`;
            }
          }
        }

        content += `</div>`;
      });

      content += `
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();
    }
  }
};
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}

.question-list {
  margin-top: 20px;
}

.question-item {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #ebeef5;
}

.question-header {
  margin-bottom: 10px;
  font-weight: bold;
}

.question-number {
  font-size: 16px;
}

.question-type {
  color: #409EFF;
  margin-right: 8px;
}

.question-score {
  color: #F56C6C;
  margin-right: 10px;
}

.knowledge-point {
  color: #67C23A;
  font-size: 13px;
}

.option-item {
  margin: 8px 0;
  padding-left: 20px;
}

.html-tag {
  font-family: monospace;
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  color: #e83e8c;
}

.answer-section {
  margin-top: 10px;
}

.answer-content {
  margin-top: 10px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.blank-answer {
  margin: 5px 0;
}

.no-answer {
  color: #909399;
  font-style: italic;
}

.analysis-content {
  line-height: 1.6;
}
</style>
