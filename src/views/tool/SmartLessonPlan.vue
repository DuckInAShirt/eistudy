<template>
  <div class="lesson-plan-container">
    <h2>智能教案生成</h2>
    <el-form :inline="true" @submit.native.prevent>
      <el-form-item label="课程">
        <el-select v-model="course" style="width:180px">
          <el-option label="电子电路基础" value="ecircuit"/>
          <el-option label="电路分析基础" value="circuit"/>
        </el-select>
      </el-form-item>
      <el-form-item label="章节/知识点">
        <el-input v-model="chapter" placeholder="如：戴维南定理" style="width:220px"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="generateLessonPlan">生成教案</el-button>
      </el-form-item>
    </el-form>
    <el-card v-if="result" class="result-card" style="margin-top:32px;">
      <div class="result-header">
        <h3>AI生成教案</h3>
        <el-button size="small" type="text" @click="copyResult" icon="el-icon-document-copy">复制</el-button>
      </div>
      <div class="markdown-content" v-html="renderedResult"></div>
    </el-card>
  </div>
</template>

<script>
import { difyWorkflowLessonPlan } from '@/api/tool/dify';
import { marked } from 'marked';

export default {
  name: 'SmartLessonPlan',
  data() {
    return {
      course: 'circuit',
      chapter: '',
      loading: false,
      result: ''
    }
  },
  computed: {
    renderedResult() {
      if (!this.result) return '';
      return marked.parse(this.result, { 
        gfm: true, 
        breaks: true,
        headerIds: false
      });
    }
  },
  methods: {
    async generateLessonPlan() {
      if (!this.chapter) {
        this.$message.warning('请输入章节/知识点');
        return;
      }
      this.loading = true;
      this.result = '';
      try {
        const data = await difyWorkflowLessonPlan(this.chapter);
        this.result = data.outputs?.lesson_plan || JSON.stringify(data.outputs || data);
      } catch (e) {
        this.result = '生成失败: ' + e.message;
      }
      this.loading = false;
    },
    copyResult() {
      if (this.result) {
        navigator.clipboard.writeText(this.result).then(() => {
          this.$message.success('教案内容已复制到剪贴板');
        }).catch(() => {
          this.$message.error('复制失败，请手动复制');
        });
      }
    }
  }
}
</script>

<style scoped>
.lesson-plan-container {
  max-width: 900px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(52,152,219,0.10);
  padding: 32px 24px;
}

.result-card {
  background: #f8fafc;
  border-radius: 12px;
  font-size: 16px;
  color: #222;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.result-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.markdown-content {
  line-height: 1.8;
  color: #2c3e50;
}

.markdown-content >>> h1,
.markdown-content >>> h2,
.markdown-content >>> h3,
.markdown-content >>> h4,
.markdown-content >>> h5,
.markdown-content >>> h6 {
  color: #1a202c;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 16px;
}

.markdown-content >>> h1 {
  font-size: 24px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

.markdown-content >>> h2 {
  font-size: 20px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 6px;
}

.markdown-content >>> h3 {
  font-size: 18px;
  color: #2d3748;
}

.markdown-content >>> h4 {
  font-size: 16px;
  color: #4a5568;
}

.markdown-content >>> p {
  margin-bottom: 16px;
  text-align: justify;
}

.markdown-content >>> ul,
.markdown-content >>> ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

.markdown-content >>> li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.markdown-content >>> strong {
  color: #2d3748;
  font-weight: 600;
}

.markdown-content >>> em {
  color: #4a5568;
  font-style: italic;
}

.markdown-content >>> blockquote {
  border-left: 4px solid #4299e1;
  padding-left: 16px;
  margin: 16px 0;
  color: #4a5568;
  background: #f7fafc;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
}

.markdown-content >>> code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #e53e3e;
}

.markdown-content >>> pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.markdown-content >>> pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}

.markdown-content >>> table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.markdown-content >>> th,
.markdown-content >>> td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.markdown-content >>> th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
}

.markdown-content >>> tr:hover {
  background: #f7fafc;
}
</style> 