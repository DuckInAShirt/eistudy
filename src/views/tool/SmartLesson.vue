<template>
  <div class="smart-lesson-container">
    <div class="lesson-header">
      <div class="header-content">
        <h1 class="title">智能教案生成</h1>
        <p class="subtitle">选择课程和知识点，AI将为您生成详细的教案内容</p>
      </div>
    </div>
    
    <div class="lesson-form">
      <div class="form-group">
        <label class="form-label">选择课程</label>
        <el-select 
          v-model="course" 
          placeholder="请选择要生成教案的课程" 
          class="lesson-select"
          ref="courseSelect"
          filterable
          clearable
        >
          <el-option v-for="item in courseList" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      
      <div class="form-group">
        <label class="form-label">知识点描述</label>
        <el-input
          ref="knowledgeInput"
          v-model="knowledge"
          type="textarea"
          :rows="6"
          :maxlength="500"
          show-word-limit
          placeholder="请详细描述要教学的知识点，例如：欧姆定律、电路分析方法、信号处理等"
          class="lesson-input"
          @keydown.ctrl.enter.native="handleSubmit"
        />
        <div class="input-tips">
          <i class="el-icon-info"></i>
          提示：详细描述知识点有助于AI生成更准确的教案内容
        </div>
      </div>
      
      <div class="form-actions">
        <el-button 
          type="primary" 
          class="lesson-btn" 
          @click="handleSubmit" 
          :loading="loading"
          :disabled="!isFormValid"
          size="large"
        >
          <i class="el-icon-magic-stick"></i>
          {{ loading ? '正在生成教案...' : '生成教案' }}
        </el-button>
        <el-button 
          @click="resetForm" 
          :disabled="loading"
          size="large"
        >
          <i class="el-icon-refresh"></i>
          重置
        </el-button>
      </div>
    </div>
    
    <div v-if="answer" class="lesson-answer">
      <div class="answer-header">
        <h3>AI生成教案</h3>
        <el-button 
          type="text" 
          @click="copyAnswer"
          size="small"
        >
          <i class="el-icon-document-copy"></i>
          复制内容
        </el-button>
      </div>
      <div class="answer-content" v-html="renderMarkdown(answer)"></div>
    </div>
  </div>
</template>

<script>
import { difyChatStream } from '@/api/tool/dify';

export default {
  name: 'SmartLesson',
  data() {
    return {
      course: '',
      courseList: [
        '电路分析基础', '电子电路基础', '信号与系统', '电磁场微波技术', '通信原理', '数字信号处理', '微电子技术'
      ],
      knowledge: '',
      answer: '',
      loading: false
    }
  },
  computed: {
    isFormValid() {
      return this.course.trim() && this.knowledge.trim() && !this.loading;
    }
  },
  mounted() {
    // 组件挂载后自动聚焦课程选择
    this.$nextTick(() => {
      this.focusCourseSelect();
    });
  },
  methods: {
    focusCourseSelect() {
      if (this.$refs.courseSelect) {
        this.$refs.courseSelect.focus();
      }
    },
    focusKnowledgeInput() {
      if (this.$refs.knowledgeInput) {
        this.$refs.knowledgeInput.focus();
      }
    },
    async handleSubmit() {
      if (!this.isFormValid) {
        if (!this.course) {
          this.$message.warning('请选择课程');
          this.focusCourseSelect();
          return;
        }
        if (!this.knowledge) {
          this.$message.warning('请输入知识点描述');
          this.focusKnowledgeInput();
          return;
        }
        return;
      }
      
      this.loading = true;
      this.answer = '';
      const prompt = `请为课程【${this.course}】的知识点【${this.knowledge}】生成详细教案。要求：
1. 教学目标明确
2. 教学内容结构清晰
3. 包含教学重点和难点
4. 提供教学方法和步骤
5. 包含课堂练习或作业建议
请以专业的教案格式输出。`;
      
      try {
        await difyChatStream(prompt, {
          onMessage: (message) => {
            this.answer += message;
          },
          onDone: () => {
            this.loading = false;
            this.$message.success('教案生成完成！');
          },
          onError: (error) => {
            this.answer = 'AI服务异常: ' + error.message;
            this.loading = false;
            this.$message.error('生成失败，请重试');
          }
        });
      } catch (e) {
        this.answer = 'AI服务异常: ' + (e.response?.data?.message || e.message);
        this.loading = false;
        this.$message.error('生成失败，请重试');
      }
    },
    resetForm() {
      this.course = '';
      this.knowledge = '';
      this.answer = '';
      this.$nextTick(() => {
        this.focusCourseSelect();
      });
    },
    copyAnswer() {
      if (this.answer) {
        navigator.clipboard.writeText(this.answer).then(() => {
          this.$message.success('内容已复制到剪贴板');
        }).catch(() => {
          this.$message.error('复制失败，请手动复制');
        });
      }
    },
    renderMarkdown(content) {
      if (!content) return '';
      // 简单换行和粗体支持
      return content
        .replace(/\r\n|\n|\r/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>');
    }
  }
}
</script>

<style scoped>
.smart-lesson-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.lesson-header {
  text-align: center;
  margin-bottom: 40px;
}

.header-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  border-radius: 16px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

.lesson-form {
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e8eaed;
}

.form-group {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.lesson-select {
  width: 100%;
}

.lesson-select >>> .el-input__inner {
  border-radius: 8px;
  border: 2px solid #e8eaed;
  transition: all 0.3s ease;
  font-size: 14px;
  height: 48px;
  line-height: 48px;
}

.lesson-select >>> .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.lesson-input {
  width: 100%;
}

.lesson-input >>> .el-textarea__inner {
  border-radius: 8px;
  border: 2px solid #e8eaed;
  transition: all 0.3s ease;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
}

.lesson-input >>> .el-textarea__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-tips {
  margin-top: 8px;
  font-size: 13px;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-tips i {
  color: #3498db;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 40px;
}

.lesson-btn {
  min-width: 160px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.lesson-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.lesson-btn:disabled {
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

.lesson-answer {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e8eaed;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f3f4;
}

.answer-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.answer-content {
  font-size: 16px;
  color: #2c3e50;
  line-height: 1.8;
  text-align: left;
}

.answer-content >>> h1,
.answer-content >>> h2,
.answer-content >>> h3 {
  color: #2c3e50;
  margin-top: 24px;
  margin-bottom: 12px;
}

.answer-content >>> strong {
  color: #e74c3c;
  font-weight: 600;
}

.answer-content >>> em {
  color: #3498db;
  font-style: italic;
}

@media (max-width: 768px) {
  .smart-lesson-container {
    padding: 20px 15px;
  }
  
  .header-content {
    padding: 30px 20px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .lesson-form {
    padding: 24px 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .lesson-btn {
    width: 100%;
  }
  
  .lesson-answer {
    padding: 24px 20px;
  }
  
  .answer-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style> 