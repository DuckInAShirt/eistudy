<template>
  <div class="exam-analysis-container">
    <h2>试卷分析</h2>
    
    <!-- 上传表单 -->
    <el-card class="upload-card">
      <div slot="header">
        <span>上传试卷文件</span>
      </div>
      
      <el-form :model="form" label-width="100px">
        <el-form-item label="课程选择">
          <el-select v-model="form.courseName" placeholder="请选择课程" style="width: 200px">
            <el-option label="电路分析基础" value="circuit"/>
            <el-option label="电子电路基础" value="ecircuit"/>
            <el-option label="信号与系统" value="signal"/>
            <el-option label="电磁场微波技术" value="microwave"/>
            <el-option label="通信原理" value="communication"/>
            <el-option label="数字信号处理" value="dsp"/>
            <el-option label="微电子技术" value="microelectronics"/>
          </el-select>
        </el-form-item>
        
        <el-form-item label="试卷文件">
          <el-upload
            ref="upload"
            :action="null"
            :auto-upload="false"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            :file-list="fileList"
            accept=".doc,.docx,.pdf,.txt"
            drag
            style="width: 100%">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
              支持 .doc, .docx, .pdf, .txt 格式文件，文件大小不超过 10MB
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            :disabled="!form.file || !form.courseName"
            @click="analyzeExam">
            开始分析
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 分析结果 -->
    <el-card v-if="result" class="result-card">
      <div slot="header" class="result-header">
        <span>分析结果</span>
        <el-button size="small" type="text" @click="copyResult" icon="el-icon-document-copy">
          复制结果
        </el-button>
      </div>
      
      <div class="analysis-content">
        <div class="file-info">
          <el-tag type="success">{{ form.file ? form.file.name : '' }}</el-tag>
          <el-tag type="info">{{ form.courseName }}</el-tag>
        </div>
        
        <div class="markdown-content" v-html="renderedResult"></div>
      </div>
    </el-card>

    <!-- 错误信息 -->
    <el-card v-if="error" class="error-card">
      <div slot="header">
        <span style="color: #f56c6c;">分析失败</span>
      </div>
      <div class="error-content">
        <i class="el-icon-warning" style="color: #f56c6c; margin-right: 8px;"></i>
        {{ error }}
      </div>
    </el-card>
  </div>
</template>

<script>
import { uploadFileToDify, getExamAnalysis } from '@/api/tool/dify';
import { marked } from 'marked';

export default {
  name: 'ExamAnalysis',
  data() {
    return {
      form: {
        courseName: 'circuit',
        file: null
      },
      fileList: [],
      loading: false,
      result: '',
      error: ''
    };
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
    handleFileChange(file) {
      this.form.file = file.raw;
      this.error = ''; // 清除之前的错误
    },
    
    beforeUpload(file) {
      const isValidType = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain'].includes(file.type);
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isValidType) {
        this.$message.error('只能上传 Word、PDF 或文本文件!');
        return false;
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB!');
        return false;
      }
      return false; // 阻止自动上传
    },
    
    async analyzeExam() {
      if (!this.form.file || !this.form.courseName) {
        this.$message.warning('请选择课程并上传文件');
        return;
      }

      this.loading = true;
      this.result = '';
      this.error = '';

      try {
        // 步骤1: 上传文件
        this.$message.info('正在上传文件...');
        const fileId = await uploadFileToDify(this.form.file);
        
        if (!fileId) {
          throw new Error('文件上传失败');
        }
        
        this.$message.success('文件上传成功，正在分析...');

        // 步骤2: 获取分析结果
        const analysisResult = await getExamAnalysis(fileId, this.form.courseName);
        
        if (analysisResult.success && analysisResult.text) {
          this.result = analysisResult.text;
          this.$message.success('试卷分析完成！');
        } else {
          throw new Error('分析结果为空');
        }

      } catch (error) {
        console.error('Analysis failed:', error);
        this.error = `分析失败: ${error.message}`;
        this.$message.error('试卷分析失败，请重试');
      } finally {
        this.loading = false;
      }
    },
    
    resetForm() {
      this.form = {
        courseName: 'circuit',
        file: null
      };
      this.fileList = [];
      this.result = '';
      this.error = '';
      this.$refs.upload.clearFiles();
    },
    
    copyResult() {
      if (this.result) {
        navigator.clipboard.writeText(this.result).then(() => {
          this.$message.success('分析结果已复制到剪贴板');
        }).catch(() => {
          this.$message.error('复制失败，请手动复制');
        });
      }
    }
  }
};
</script>

<style scoped>
.exam-analysis-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.exam-analysis-container h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

.upload-card {
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.upload-card >>> .el-card__header {
  background: #f8fafc;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
  color: #2c3e50;
}

.result-card {
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-content {
  padding: 20px 0;
}

.file-info {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.error-card {
  border-color: #f56c6c;
  border-radius: 12px;
}

.error-card >>> .el-card__header {
  background: #fef0f0;
  border-bottom: 1px solid #f56c6c;
  color: #f56c6c;
  font-weight: 600;
}

.error-content {
  color: #f56c6c;
  display: flex;
  align-items: center;
  font-size: 14px;
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

/* 上传组件样式优化 */
.upload-card >>> .el-upload-dragger {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.upload-card >>> .el-upload-dragger:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-card >>> .el-upload-dragger .el-icon-upload {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-card >>> .el-upload__text {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.upload-card >>> .el-upload__text em {
  color: #409eff;
  font-style: normal;
}
</style> 