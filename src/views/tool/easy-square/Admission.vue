<template>
  <div class="admission-chat">
    <div class="page-hero" :style="bgStyle('admission')">
      <h2>招生咨询</h2>
      <p>招生政策、报考流程与注意事项智能问答</p>
    </div>
    
    <div class="chat-container">
      <div class="chat-history" ref="chatHistoryRef">
        <div v-for="msg in messages" :key="msg.id" :class="['message-item', msg.role]">
          <span class="role-label">{{ msg.role === 'user' ? '我' : 'AI' }}：</span>
          <div v-html="renderMessage(msg.content)" class="message-content"></div>
        </div>
      </div>
      
      <div class="chat-input">
        <div class="input-container">
          <el-input
            ref="inputRef"
            v-model="input"
            placeholder="请输入你的问题 (Enter 发送，Ctrl+Enter 换行)"
            @keydown.native="handleKeydown"
            @input="handleInput"
            clearable
            type="textarea"
            :rows="inputRows"
            :maxlength="1000"
            show-word-limit
            resize="none"
            :disabled="loading"
            class="chat-textarea"
          />
          <div class="input-actions">
            <el-button 
              type="primary" 
              @click="sendMessage" 
              :loading="loading" 
              size="medium"
              :disabled="!input.trim()"
              class="send-btn"
            >
              <i class="el-icon-s-promotion"></i>
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { difyChatStream, DIFY_API_KEYS, DIFY_API_URLS } from '@/api/tool/dify'
import { marked } from 'marked'

// 招生咨询的 Dify API Key 和 URL
const ADMISSION_API_KEY = DIFY_API_KEYS.admission || DIFY_API_KEYS.default
const ADMISSION_API_URL = DIFY_API_URLS.admission || DIFY_API_URLS.default

export default {
  name: 'EasyAdmission',
  data() {
    return {
      input: '',
      messages: [],
      loading: false,
      inputRows: 3,
      minRows: 3,
      maxRows: 8,
      conversationId: '' // 用于保持对话上下文
    }
  },
  mounted() {
    // 组件挂载后自动聚焦输入框
    this.$nextTick(() => {
      this.focusInput()
    })
  },
  created() {
    // 添加一条欢迎消息
    this.messages.push({
      id: Date.now(),
      role: 'assistant',
      content: '你好！我是**招生咨询**AI助手，可以为你解答招生政策、报考流程、注意事项等问题。有什么可以帮助你的吗？'
    })
  },
  methods: {
    bgStyle(type) {
      const map = {
        'admission': '/img/easy-square/admission.svg'
      }
      return {
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.45)), url('${map[type]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    focusInput() {
      if (this.$refs.inputRef) {
        this.$refs.inputRef.focus()
      }
    },
    async scrollToBottom() {
      await this.$nextTick()
      const el = this.$refs.chatHistoryRef
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    },
    handleKeydown(event) {
      // Ctrl+Enter 换行，Enter 发送
      if (event.key === 'Enter') {
        if (event.ctrlKey) {
          return
        } else {
          event.preventDefault()
          this.sendMessage()
        }
      }
    },
    handleInput() {
      // 动态调整输入框高度
      const lines = this.input.split('\n').length
      const newRows = Math.max(this.minRows, Math.min(this.maxRows, lines))
      if (newRows !== this.inputRows) {
        this.inputRows = newRows
      }
    },
    async sendMessage() {
      if (!this.input.trim() || this.loading) return

      const userMessageContent = this.input
      // 推送用户消息
      this.messages.push({ role: 'user', content: userMessageContent, id: Date.now() })
      this.input = ''
      this.inputRows = this.minRows
      this.scrollToBottom()

      this.loading = true

      // 创建一个 AI 消息的占位符
      const aiMessageId = Date.now() + 1
      this.messages.push({ role: 'assistant', content: '...', id: aiMessageId })
      this.scrollToBottom()

      // 调用流式接口
      // 使用招生咨询专用的 API URL 和参数
      await difyChatStream(
        userMessageContent,
        {
          onMessage: (chunk) => {
            // 找到 AI 消息并追加内容
            const aiMessage = this.messages.find(m => m.id === aiMessageId)
            if (aiMessage) {
              if (aiMessage.content === '...') {
                aiMessage.content = chunk
              } else {
                aiMessage.content += chunk
              }
              this.scrollToBottom()
            }
          },
          onConversationId: (conversationId) => {
            // 保存 conversation_id，用于后续对话保持上下文
            this.conversationId = conversationId
            console.log('Conversation ID:', conversationId)
          },
          onDone: () => {
            this.loading = false
            console.log('Stream finished.')
            this.$nextTick(() => {
              this.focusInput()
            })
          },
          onError: (e) => {
            const aiMessage = this.messages.find(m => m.id === aiMessageId)
            if (aiMessage) {
              aiMessage.content = 'AI 服务异常: ' + e.message
            }
            this.loading = false
            console.error('Dify API error:', e)
            this.$message.error('AI 服务异常，请稍后重试')
            this.$nextTick(() => {
              this.focusInput()
            })
          }
        },
        ADMISSION_API_KEY,  // API Key
        ADMISSION_API_URL,  // Base URL
        this.conversationId, // conversation_id (使用保存的 ID 保持上下文)
        'abc-123'            // user ID
      )
    },
    // 使用 marked 渲染 Markdown
    renderMessage(content) {
      if (!content) return ''
      return marked.parse(content, { gfm: true, breaks: true })
    }
  }
}
</script>

<style scoped>
.admission-chat {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.page-hero {
  border-radius: 12px;
  color: #fff;
  padding: 36px 20px;
  margin-bottom: 20px;
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

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.chat-history {
  flex: 1;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  overflow-y: auto;
  min-height: 400px;
  max-height: calc(100vh - 400px);
  scroll-behavior: smooth;
}

.message-item {
  display: flex;
  margin-bottom: 15px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.role-label {
  font-weight: 600;
  margin: 0 8px;
  padding-top: 6px;
  font-size: 14px;
}

.user .role-label {
  color: #409EFF;
}

.assistant .role-label {
  color: #67C23A;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  word-wrap: break-word;
  line-height: 1.6;
  text-align: left;
}

.message-content >>> p:first-child {
  margin-top: 0;
}

.message-content >>> p:last-child {
  margin-bottom: 0;
}

.message-content >>> pre {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
}

.message-content >>> code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.message-content >>> pre code {
  background: transparent;
  padding: 0;
}

.user .message-content {
  background: #409EFF;
  color: white;
}

.assistant .message-content {
  background: white;
  color: #333;
}

.chat-input {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-textarea {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.chat-textarea >>> .el-textarea__inner {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  font-size: 14px;
  line-height: 1.5;
}

.chat-textarea >>> .el-textarea__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
}

.send-btn {
  height: 36px;
  padding: 0 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.send-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

@media (max-width: 768px) {
  .admission-chat {
    padding: 15px;
  }
  
  .chat-container {
    padding: 15px;
  }
  
  .chat-history {
    min-height: 300px;
    max-height: calc(100vh - 350px);
  }
  
  .message-content {
    max-width: 85%;
    padding: 10px 12px;
  }
  
  .chat-input {
    flex-direction: column;
    gap: 10px;
  }
  
  .input-actions {
    justify-content: center;
  }
  
  .send-btn {
    height: 40px;
    width: 100%;
  }
}
</style>
