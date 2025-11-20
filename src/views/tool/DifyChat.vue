<template>
  <div class="dify-chat">
    <div class="chat-header">
      <div class="header-left">
        <el-button icon="el-icon-arrow-left" @click="goBack" size="small">返回</el-button>
        <h3>{{ chatTitle }}</h3>
      </div>
    </div>
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
</template>

<script>
// 导入需要的函数和库
import { difyChatStream } from '@/api/tool/dify'; 
import { marked } from 'marked';

const apikeyMap = {
  'ecircuit': 'app-afkfBEWGtMWAEQfCRzkPva64', // 电子电路基础
  'circuit': 'app-AbJMJlJW3fiph9QF2H9N2Pym', // 电路分析基础
  // 其他类型可继续扩展
};
const defaultKey = 'app-J4y46SO9GtwtjADyLAOj9tzL';

// 使用标准的 Vue 2 Options API 导出组件
export default {
  name: 'DifyChat',
  data() {
    return {
      input: '',
      messages: [],
      loading: false,
      chatType: 'main',
      inputRows: 3,
      minRows: 3,
      maxRows: 8
    };
  },
  computed: {
    chatTitle() {
      const typeMap = {
        'main': '电子信息课程综合问答',
        'circuit': '电路分析基础',
        'ecircuit': '电子电路基础',
        'signal': '信号与系统',
        'microwave': '电磁场微波技术',
        'communication': '通信原理',
        'dsp': '数字信号处理',
        'microelectronics': '微电子技术',
        // 易学广场新增类型
        'admission': '招生咨询',
        'job-info': '招聘信息',
        'resume-opt': '简历优化',
        'paper-topic': '论文选题',
        'proposal-opt': '开题报告优化',
        'paper-writing': '论文撰写'
      };
      return typeMap[this.chatType] || '智能问答';
    }
  },
  mounted() {
    // 组件挂载后自动聚焦输入框
    this.$nextTick(() => {
      this.focusInput();
    });
  },
  created() {
    // 组件创建时，从路由获取类型
    this.chatType = this.$route.query.type || 'main';
    // 添加一条欢迎消息
    this.messages.push({
      id: Date.now(),
      role: 'assistant',
      content: `你好！我是 **${this.chatTitle}** 领域的 AI 助手，有什么可以帮助你的吗？`
    });
  },
  methods: {
    focusInput() {
      if (this.$refs.inputRef) {
        this.$refs.inputRef.focus();
      }
    },
    goBack() {
      this.$router.push('/tool/smart-qa');
    },
    async scrollToBottom() {
      // this.$nextTick 确保在 DOM 更新后执行
      await this.$nextTick();
      const el = this.$refs.chatHistoryRef;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    },
    handleKeydown(event) {
      // Ctrl+Enter 换行，Enter 发送
      if (event.key === 'Enter') {
        if (event.ctrlKey) {
          // Ctrl+Enter 换行，不阻止默认行为
          return;
        } else {
          // Enter 发送
          event.preventDefault();
          this.sendMessage();
        }
      }
    },
    handleInput() {
      // 动态调整输入框高度
      const lines = this.input.split('\n').length;
      const newRows = Math.max(this.minRows, Math.min(this.maxRows, lines));
      if (newRows !== this.inputRows) {
        this.inputRows = newRows;
      }
    },
    async sendMessage() {
      if (!this.input.trim() || this.loading) return;

      const userMessageContent = this.input;
      // 推送用户消息
      this.messages.push({ role: 'user', content: userMessageContent, id: Date.now() });
      this.input = '';
      this.inputRows = this.minRows; // 重置输入框高度
      this.scrollToBottom();

      this.loading = true;

      // 创建一个 AI 消息的占位符
      const aiMessageId = Date.now() + 1;
      this.messages.push({ role: 'assistant', content: '...', id: aiMessageId });
      this.scrollToBottom();

      // 选择apikey
      const apikey = apikeyMap[this.chatType] || defaultKey;
      // 调用流式接口
      await difyChatStream(userMessageContent, {
        onMessage: (chunk) => {
          // 找到 AI 消息并追加内容
          const aiMessage = this.messages.find(m => m.id === aiMessageId);
          if (aiMessage) {
            if (aiMessage.content === '...') {
              aiMessage.content = chunk;
            } else {
              aiMessage.content += chunk;
            }
            this.scrollToBottom();
          }
        },
        onDone: () => {
          this.loading = false;
          console.log('Stream finished.');
          // 对话完成后重新聚焦输入框
          this.$nextTick(() => {
            this.focusInput();
          });
        },
        onError: (e) => {
          const aiMessage = this.messages.find(m => m.id === aiMessageId);
          if (aiMessage) {
            aiMessage.content = 'AI 服务异常: ' + e.message;
          }
          this.loading = false;
          console.error('Dify API error:', e);
          // 错误后重新聚焦输入框
          this.$nextTick(() => {
            this.focusInput();
          });
        }
      }, apikey);
    },
    // 使用 marked 渲染 Markdown
    renderMessage(content) {
      if (!content) return '';
      return marked.parse(content, { gfm: true, breaks: true });
    }
  }
};
</script>

<style scoped>
/* 样式部分保持完全不变 */
.dify-chat { 
  max-width: 900px; 
  margin: 0 auto; 
  padding: 20px;
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 20px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.chat-history { 
  flex: 1;
  border-radius: 8px;
  margin-bottom: 20px; 
  padding: 15px; 
  background: #f5f7fa;
  overflow-y: auto;
  min-height: 400px;
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

.user .role-label { color: #409EFF; }
.assistant .role-label { color: #67C23A; }

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  word-wrap: break-word;
  line-height: 1.6;
  text-align: left;
}
.message-content >>> p:first-child { margin-top: 0; }
.message-content >>> p:last-child { margin-bottom: 0; }
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
  .dify-chat {
    padding: 15px;
    height: calc(100vh - 60px);
  }
  .chat-header {
    padding: 0 0 15px 0;
    margin-bottom: 15px;
  }
  .header-left h3 { font-size: 16px; }
  .chat-history { padding: 10px; min-height: 300px; }
  .message-content { max-width: 85%; padding: 10px 12px; }
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