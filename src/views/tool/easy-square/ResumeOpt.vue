<template>
  <div class="page-wrap">
    <div class="page-hero" :style="bgStyle('resume-opt')">
      <h2>简历优化</h2>
      <p>上传您的简历，输入目标职位描述，获取AI智能优化建议</p>
    </div>
    
    <div class="page-body">
      <el-steps :active="step" finish-status="success" align-center style="margin-bottom: 30px;">
        <el-step title="上传简历" />
        <el-step title="输入职位描述" />
        <el-step title="获取优化建议" />
      </el-steps>

      <!-- 步骤1: 上传简历 -->
      <div v-if="step === 0" class="step-content">
        <el-upload
          class="upload-demo"
          drag
          :action="''"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="1"
          accept=".pdf,.doc,.docx,.txt"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将简历文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">支持 PDF、Word、TXT 格式，文件大小不超过 10MB</div>
        </el-upload>
        <div class="step-actions">
          <el-button type="primary" @click="handleUpload" :loading="uploading" :disabled="!selectedFile">
            上传文件
          </el-button>
        </div>
      </div>

      <!-- 步骤2: 输入职位描述 -->
      <div v-if="step === 1" class="step-content">
        <el-form :model="form" label-width="120px" class="job-form">
          <el-form-item label="职位描述">
            <el-input
              type="textarea"
              :rows="8"
              v-model="form.jobDescription"
              placeholder="请输入您要应聘的职位描述，包括岗位职责、任职要求等（最多1024个字符）..."
              maxlength="1024"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        
        <!-- 优化进度条 -->
        <div v-if="optimizing" class="optimize-progress">
          <el-progress 
            :percentage="progressPercentage" 
            :status="progressStatus"
            :stroke-width="8"
            :show-text="true"
          >
            <template slot="format">
              <span class="progress-text">{{ progressText }}</span>
            </template>
          </el-progress>
          <p class="progress-tip">{{ progressTip }}</p>
        </div>
        
        <div class="step-actions">
          <el-button @click="step = 0" :disabled="optimizing">上一步</el-button>
          <el-button type="primary" @click="handleOptimize" :loading="optimizing" :disabled="!form.jobDescription.trim() || optimizing">
            开始优化
          </el-button>
        </div>
      </div>

      <!-- 步骤3: 显示结果 -->
      <div v-if="step === 2" class="step-content">
        <div class="result-header">
          <h3>优化建议</h3>
          <el-button type="text" @click="handleReset">重新优化</el-button>
        </div>
        <div class="result-content" v-if="result">
          <div class="result-text" v-html="formatResult(result)"></div>
        </div>
        <div v-else class="result-empty">
          <el-empty description="暂无优化建议"></el-empty>
        </div>
      </div>

      <!-- 错误提示 -->
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="true"
        @close="error = ''"
        style="margin-top: 20px;"
      />
    </div>
  </div>
</template>

<script>
import { uploadResumeFile, optimizeResume } from '@/api/tool/dify'
import { marked } from 'marked'

export default {
  name: 'EasyResumeOpt',
  data() {
    return {
      step: 0,
      fileList: [],
      selectedFile: null,
      uploading: false,
      optimizing: false,
      fileId: '',
      form: {
        jobDescription: ''
      },
      result: '',
      error: '',
      progressPercentage: 0,
      progressStatus: null,
      progressText: '正在分析简历...',
      progressTip: 'AI 正在分析您的简历和职位描述，请稍候...',
      progressTimer: null
    }
  },
  methods: {
    bgStyle(type) {
      const map = { 'resume-opt': '/img/easy-square/resume-opt.png' }
      return {
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.45)), url('${map[type]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    handleFileChange(file, fileList) {
      this.selectedFile = file.raw
      this.fileList = fileList
      this.error = ''
    },
    async handleUpload() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择文件')
        return
      }

      // 检查文件大小（10MB）
      if (this.selectedFile.size > 10 * 1024 * 1024) {
        this.$message.error('文件大小不能超过 10MB')
        return
      }

      this.uploading = true
      this.error = ''

      try {
        const fileId = await uploadResumeFile(this.selectedFile)
        if (fileId) {
          this.fileId = fileId
          this.$message.success('文件上传成功')
          this.step = 1
        } else {
          throw new Error('上传失败，未返回文件ID')
        }
      } catch (error) {
        this.error = '文件上传失败：' + (error.message || '未知错误')
        this.$message.error(this.error)
      } finally {
        this.uploading = false
      }
    },
    async handleOptimize() {
      if (!this.form.jobDescription.trim()) {
        this.$message.warning('请输入职位描述')
        return
      }

      // 验证字符长度（Dify API 限制为 1024 字符）
      if (this.form.jobDescription.length > 1024) {
        this.$message.error('职位描述不能超过 1024 个字符，当前为 ' + this.form.jobDescription.length + ' 个字符')
        return
      }

      if (!this.fileId) {
        this.$message.error('请先上传简历文件')
        this.step = 0
        return
      }

      this.optimizing = true
      this.error = ''
      this.progressPercentage = 0
      this.progressStatus = null
      this.progressText = '正在分析简历...'
      this.progressTip = 'AI 正在分析您的简历和职位描述，请稍候...'

      // 启动进度条模拟
      this.startProgress()

      try {
        const response = await optimizeResume(this.fileId, this.form.jobDescription)
        if (response.success && response.text) {
          // 进度完成
          this.progressPercentage = 100
          this.progressStatus = 'success'
          this.progressText = '优化完成'
          this.progressTip = '简历优化建议已生成'
          
          // 延迟一下再跳转，让用户看到完成状态
          setTimeout(() => {
            this.result = response.text
            this.step = 2
            this.$message.success('优化完成')
            this.stopProgress()
          }, 500)
        } else {
          throw new Error('优化失败，未返回结果')
        }
      } catch (error) {
        this.stopProgress()
        this.progressStatus = 'exception'
        this.progressText = '优化失败'
        this.progressTip = '请检查网络连接或稍后重试'
        this.error = '优化失败：' + (error.message || '未知错误')
        this.$message.error(this.error)
        this.optimizing = false
      }
    },
    startProgress() {
      // 清除之前的定时器
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
      }
      
      // 模拟进度更新（总时长约60秒）
      this.progressPercentage = 10
      const startTime = Date.now()
      const totalDuration = 60000 // 60秒
      const targetPercent = 98 // 最终进度98%，等待API返回后到100%
      
      // 定义不同阶段的提示信息
      const stages = [
        { minPercent: 10, maxPercent: 25, text: '正在解析简历内容...', tip: 'AI 正在读取和分析您的简历信息' },
        { minPercent: 25, maxPercent: 45, text: '正在匹配职位要求...', tip: 'AI 正在对比简历与职位描述的匹配度' },
        { minPercent: 45, maxPercent: 65, text: '正在生成优化建议...', tip: 'AI 正在为您生成个性化的优化建议' },
        { minPercent: 65, maxPercent: 85, text: '正在完善优化方案...', tip: 'AI 正在完善优化方案的细节' },
        { minPercent: 85, maxPercent: 95, text: '即将完成...', tip: '优化建议即将生成完成' },
        { minPercent: 95, maxPercent: 98, text: '最后检查...', tip: '正在做最后的检查和优化' }
      ]
      
      // 每1.5秒更新一次进度
      this.progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / totalDuration, 0.98) // 最多到98%
        this.progressPercentage = Math.floor(10 + (targetPercent - 10) * progress)
        
        // 根据当前进度更新提示文字
        const currentStage = stages.find(stage => 
          this.progressPercentage >= stage.minPercent && this.progressPercentage < stage.maxPercent
        ) || stages[stages.length - 1]
        
        this.progressText = currentStage.text
        this.progressTip = currentStage.tip
        
        // 如果已经到98%，停止更新
        if (this.progressPercentage >= 98) {
          this.progressPercentage = 98
          this.progressText = '即将完成...'
          this.progressTip = '优化建议即将生成完成，请稍候...'
        }
      }, 1500) // 每1.5秒更新一次
    },
    stopProgress() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
      }
    },
    formatResult(text) {
      if (!text) return ''
      // 使用 marked 渲染 Markdown
      return marked.parse(text, { gfm: true, breaks: true })
    },
    handleReset() {
      this.stopProgress()
      this.step = 0
      this.fileList = []
      this.selectedFile = null
      this.fileId = ''
      this.form.jobDescription = ''
      this.result = ''
      this.error = ''
      this.progressPercentage = 0
      this.progressStatus = null
    }
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    this.stopProgress()
  }
}
</script>

<style scoped>
.page-wrap {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-hero {
  border-radius: 12px;
  color: #fff;
  padding: 36px 20px;
  margin-bottom: 16px;
  text-align: center;
}

.page-hero h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.page-hero p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.page-body {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
}

.step-content {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-demo {
  margin: 20px auto;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
}

/* .upload-demo >>> .el-upload-dragger {
  text-align: center;
} */

.upload-demo >>> .el-upload__tip {
  text-align: center;
  margin-top: 10px;
}

.job-form {
  width: 100%;
  max-width: 700px;
}

.optimize-progress {
  width: 100%;
  max-width: 700px;
  margin: 30px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.optimize-progress >>> .el-progress {
  margin-bottom: 15px;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.progress-tip {
  margin: 10px 0 0 0;
  font-size: 13px;
  color: #909399;
  text-align: center;
}

.step-actions {
  text-align: center;
  margin-top: 30px;
}

.step-actions .el-button {
  margin: 0 10px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.result-header h3 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.result-content {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  min-height: 200px;
}

.result-text {
  line-height: 1.8;
  color: #606266;
  word-wrap: break-word;
}

.result-text >>> p {
  margin: 10px 0;
}

.result-text >>> h1,
.result-text >>> h2,
.result-text >>> h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #303133;
}

.result-text >>> ul,
.result-text >>> ol {
  margin: 10px 0;
  padding-left: 30px;
}

.result-text >>> li {
  margin: 5px 0;
}

.result-text >>> code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.result-text >>> pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 15px 0;
}

.result-text >>> pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}

.result-empty {
  padding: 40px 0;
}
</style>
