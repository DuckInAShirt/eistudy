<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <h2 class="section-title">聊天记录管理</h2>
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="80px">
        <el-form-item label="聊天ID" prop="ltId">
          <el-input
            v-model="queryParams.ltId"
            placeholder="输入聊天ID查看完整对话"
            clearable
            @keyup.enter.native="handleQuery"
          >
            <el-tooltip slot="suffix" content="输入聊天ID以查看完整对话上下文" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </el-input>
        </el-form-item>
<!--        <el-form-item label="归属方" prop="role">-->
<!--          <el-select v-model="queryParams.role" placeholder="请选择归属方" clearable>-->
<!--            <el-option label="用户" value="user" />-->
<!--            <el-option label="系统" value="system" />-->
<!--            <el-option label="管理员" value="admin" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="queryParams.userName"
            placeholder="请输入用户名"
            clearable
            @keyup.enter.native="handleQuery"
          >
            <el-tooltip slot="suffix" content="输入学工号以查询对话记录" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 视图切换和提示区域 -->
    <div class="view-control-section">
      <div class="view-mode-tabs">
        <div
          class="view-tab"
          :class="{ 'active': viewMode === 'card' }"
          @click="viewMode = 'card'"
        >
          <i class="el-icon-s-grid"></i> 卡片视图
        </div>
        <div
          class="view-tab"
          :class="{ 'active': viewMode === 'chat' }"
          @click="viewMode = 'chat'"
        >
          <i class="el-icon-chat-dot-round"></i> 对话视图
        </div>
      </div>

      <!-- 搜索结果提示 -->
      <div class="search-result" v-if="isSearchActive">
        <el-tag type="info" effect="plain" size="medium">
          <template v-if="queryParams.ltId">
            聊天ID: <b>{{ queryParams.ltId }}</b>
          </template>
          <template v-if="queryParams.role">
            归属方: <b>{{ getRoleName(queryParams.role) }}</b>
          </template>
          <template v-if="queryParams.userName">
            用户名: <b>{{ queryParams.userName }}</b>
          </template>
          <template>
            共 <b>{{ total }}</b> 条记录
          </template>
          <i class="el-icon-close close-icon" @click="resetQuery"></i>
        </el-tag>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card'" class="card-view">
      <div
        class="cards-container"
        v-loading="loading"
        element-loading-text="加载中..."
        v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="infiniteScrollDisabled"
        :infinite-scroll-distance="10"
      >
        <div class="masonry-layout">
          <div
            v-for="item in xxList"
            :key="item.xxId"
            class="card-wrapper"
            :class="{ 'highlight': queryParams.ltId === item.ltId }"
          >
            <div class="message-card" @click="openDetailDialog(item)">
              <div class="card-header">
                <span class="chat-id" @click.stop="showContextMessages(item.ltId)">#{{ item.ltId }}</span>
                <el-tag size="mini" :type="roleTagType(item.role)" class="role-tag">
                  {{ getRoleName(item.role) }}
                </el-tag>
                <span v-if="item.role === 'user' && item.userName" class="user-name">{{ item.userName }}</span>
              </div>
              <div class="card-body">
                <div class="message-content">{{ item.xxContent }}</div>
              </div>
              <div class="card-footer">
                <span class="time">{{ formatTime(item.createTime) }}</span>
                <el-button
                  type="text"
                  size="mini"
                  class="context-btn"
                  @click.stop="showContextMessages(item.ltId)"
                >
                  <i class="el-icon-view"></i> 上下文
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多提示 -->
        <div class="load-more-status" v-show="xxList.length > 0">
          <p v-if="loading && !firstLoad">加载中...</p>
          <p v-else-if="hasReachedEnd">没有更多数据了</p>
          <p v-else>继续滚动加载更多</p>
        </div>
      </div>
    </div>

    <!-- 对话视图 -->
    <div v-if="viewMode === 'chat'" class="chat-view">
      <div
        class="chat-container"
        v-loading="loading"
        element-loading-text="加载中..."
        v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="infiniteScrollDisabled"
        :infinite-scroll-distance="10"
      >
        <div class="message-timeline">
          <div
            v-for="item in xxList"
            :key="item.xxId"
            class="timeline-message"
            :class="[item.role, { 'highlight': queryParams.ltId === item.ltId }]"
          >
            <div class="message-info">
              <span class="message-id">#{{ item.xxId }}</span>
              <span
                class="chat-id"
                @click="showContextMessages(item.ltId)"
              >
                对话: #{{ item.ltId }}
              </span>
              <el-tag size="mini" :type="roleTagType(item.role)">
                {{ getRoleName(item.role) }}
              </el-tag>
              <span v-if="item.role === 'user' && item.userName" class="user-name">
                <i class="el-icon-user"></i> {{ item.userName }}
              </span>
              <span class="time">{{ formatTime(item.createTime) }}</span>
            </div>
            <div class="message-bubble" @click="openDetailDialog(item)">
              {{ item.xxContent }}
            </div>
            <div class="message-actions">
              <el-button
                type="text"
                size="mini"
                @click="showContextMessages(item.ltId)"
              >
                <i class="el-icon-view"></i> 查看对话上下文
              </el-button>
            </div>
          </div>
        </div>

        <!-- 加载更多提示 -->
        <div class="load-more-status" v-show="xxList.length > 0">
          <p v-if="loading && !firstLoad">加载中...</p>
          <p v-else-if="hasReachedEnd">没有更多数据了</p>
          <p v-else>继续滚动加载更多</p>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div class="no-data" v-if="xxList.length === 0 && !loading">
      <el-empty description="暂无聊天记录" :image-size="100"></el-empty>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      title="消息详情"
      :visible.sync="detailDialogVisible"
      width="700px"
      custom-class="detail-dialog"
      :close-on-click-modal="true"
      append-to-body
    >
      <div class="detail-container" v-if="currentDetail">
        <div class="detail-header">
          <div class="meta-info">
            <div class="meta-item">
              <label>消息ID:</label>
              <span>{{ currentDetail.xxId }}</span>
            </div>
            <div class="meta-item">
              <label>聊天ID:</label>
              <span>{{ currentDetail.ltId }}</span>
            </div>
            <div class="meta-item">
              <label>归属方:</label>
              <el-tag size="small" :type="roleTagType(currentDetail.role)">
                {{ getRoleName(currentDetail.role) }}
              </el-tag>
            </div>
            <!-- 添加用户名显示 -->
            <div class="meta-item" v-if="currentDetail.role === 'user' && currentDetail.userName">
              <label>用户名:</label>
              <span>{{ currentDetail.userName }}</span>
            </div>
            <div class="meta-item">
              <label>时间:</label>
              <span>{{ currentDetail.createTime }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-chat-dot-round"
              @click="switchToContextView"
            >查看对话上下文</el-button>
          </div>
        </div>
        <div class="detail-content">
          <h4>消息内容</h4>
          <div class="content-box">{{ currentDetail.xxContent }}</div>
        </div>
      </div>

      <div class="detail-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 上下文对话框 -->
    <el-dialog
      title="对话上下文"
      :visible.sync="contextDialogVisible"
      width="800px"
      custom-class="context-dialog"
      :close-on-click-modal="true"
      append-to-body
    >
      <div class="context-container" v-loading="contextLoading">
        <div class="context-header">
          <div class="context-info">
            <span class="chat-id">聊天ID: {{ currentContextId }}</span>
            <span class="message-count">共 {{ contextMessages.length }} 条消息</span>
          </div>
        </div>
        <div class="message-timeline">
          <div
            v-for="message in contextMessages"
            :key="message.xxId"
            class="timeline-message"
            :class="[message.role, { 'current': message.xxId === currentMessageId }]"
          >
            <div class="message-header">
              <span class="message-role">{{ getRoleName(message.role) }}</span>
              <!-- 添加用户名显示 -->
              <span v-if="message.role === 'user' && message.userName" class="message-user">
                  <i class="el-icon-user"></i> {{ message.userName }}
              </span>
              <span class="message-time">{{ formatTime(message.createTime) }}</span>
            </div>
            <div class="message-body">
              {{ message.xxContent }}
            </div>
          </div>
        </div>
        <div class="no-context" v-if="contextMessages.length === 0 && !contextLoading">
          <el-empty description="未找到相关对话" :image-size="100"></el-empty>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="contextDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="switchToMainContextView">在主视图中查看</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listXx, getXx } from "@/api/system/xx";

export default {
  name: "Xx",
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: true,
      // 总条数
      total: 0,
      // 聊天记录数据
      xxList: [],
      // 视图模式
      viewMode: 'card',
      // 详情对话框
      detailDialogVisible: false,
      currentDetail: null,
      // 上下文对话框
      contextDialogVisible: false,
      contextLoading: false,
      contextMessages: [],
      currentContextId: null,
      currentMessageId: null,
      // 无限滚动
      hasReachedEnd: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 12,
        xxContent: null,
        ltId: null,
        role: null,
        userName: null, // 添加用户名字段
      }
    };
  },
  computed: {
    // 是否有搜索条件激活
    isSearchActive() {
      return this.queryParams.ltId || this.queryParams.role || this.queryParams.userName;
    },
    // 无限滚动是否禁用
    infiniteScrollDisabled() {
      return this.loading || this.hasReachedEnd;
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询聊天记录列表 */
    getList() {
      this.loading = true;
      this.firstLoad = false;
      listXx(this.queryParams).then(response => {
        if (this.queryParams.pageNum === 1) {
          this.xxList = response.rows;
        } else {
          this.xxList = [...this.xxList, ...response.rows];
        }
        this.total = response.total;
        this.loading = false;
        // 判断是否已加载全部数据
        this.hasReachedEnd = this.xxList.length >= this.total;
      });
    },

    // 加载更多数据
    loadMore() {
      if (this.loading || this.hasReachedEnd) return;

      this.queryParams.pageNum += 1;
      this.getList();
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return '';

      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // 打开详情对话框
    openDetailDialog(item) {
      this.currentDetail = item;
      this.detailDialogVisible = true;
    },

    // 切换到上下文视图
    switchToContextView() {
      if (this.currentDetail) {
        this.showContextMessages(this.currentDetail.ltId, this.currentDetail.xxId);
      }
      this.detailDialogVisible = false;
    },

    // 切换到主视图的上下文模式
    switchToMainContextView() {
      this.contextDialogVisible = false;
      this.showContextMessages(this.currentContextId);
    },

    // 显示上下文消息
    showContextMessages(ltId, xxId = null) {
      if (xxId) {
        // 在对话框中显示上下文
        this.contextDialogVisible = true;
        this.contextLoading = true;
        this.currentContextId = ltId;
        this.currentMessageId = xxId;
        this.getContextMessages(ltId);
      } else {
        // 在主视图中显示上下文
        this.queryParams.ltId = ltId;
        this.queryParams.role = null;
        this.queryParams.pageNum = 1;
        this.hasReachedEnd = false;
        this.getList();
      }
    },

    // 获取上下文消息
    getContextMessages(ltId) {
      const params = {
        ltId: ltId,
        pageSize: 100 // 获取更多消息以确保完整上下文
      };

      // 使用已有的API获取上下文消息
      listXx(params).then(response => {
        this.contextMessages = response.rows;
        this.contextLoading = false;
      }).catch(() => {
        this.contextLoading = false;
        this.$message.error('获取上下文消息失败');
      });
    },

    // 获取角色名称
    getRoleName(role) {
      const roles = {
        'user': '用户',
        'system': '系统',
        'admin': '管理员'
      };
      return roles[role] || role;
    },

    // 根据角色返回tag类型
    roleTagType(role) {
      const types = {
        'user': '',
        'system': 'success',
        'admin': 'warning'
      };
      return types[role] || 'info';
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.hasReachedEnd = false;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.ltId = null;
      this.queryParams.role = null;
      this.queryParams.userName = null; // 添加重置用户名
      this.queryParams.pageNum = 1;
      this.hasReachedEnd = false;
      this.handleQuery();
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  .section-title {
    margin: 0 0 20px;
    font-size: 20px;
    color: #303133;
    font-weight: 600;
  }

  .search-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }

  .view-control-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .view-mode-tabs {
      display: flex;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      .view-tab {
        padding: 12px 24px;
        cursor: pointer;
        color: #606266;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;

        &:hover {
          background: #f5f7fa;
        }

        &.active {
          background: #409EFF;
          color: white;
        }

        i {
          font-size: 16px;
        }
      }
    }

    .search-result {
      .el-tag {
        padding: 8px 12px;
        font-size: 14px;

        .close-icon {
          margin-left: 8px;
          cursor: pointer;

          &:hover {
            color: #F56C6C;
          }
        }
      }
    }
  }

  // 卡片视图样式
  .card-view {
    .cards-container {
      min-height: 300px;
      max-height: calc(100vh - 220px);
      overflow-y: auto;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);

      .masonry-layout {
        column-count: 4;
        column-gap: 20px;

        @media (max-width: 1400px) {
          column-count: 3;
        }

        @media (max-width: 991px) {
          column-count: 2;
        }

        @media (max-width: 767px) {
          column-count: 1;
        }

        .card-wrapper {
          break-inside: avoid-column;
          margin-bottom: 20px;

          &.highlight .message-card {
            border: 2px solid #409EFF;
            background: #ecf5ff;
          }
        }
      }
    }

    .message-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      cursor: pointer;
      border: 1px solid #ebeef5;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #f0f0f0;

        .chat-id {
          font-size: 15px;
          font-weight: 600;
          color: #409EFF;
          cursor: pointer;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .card-body {
        padding: 16px;

        .message-content {
          font-size: 14px;
          line-height: 1.6;
          color: #606266;
          max-height: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }

      .card-footer {
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f9f9f9;

        .time {
          font-size: 12px;
          color: #909399;
        }

        .context-btn {
          color: #409EFF;
          background: #ecf5ff;
          border-radius: 4px;
          padding: 5px 10px;

          &:hover {
            background: #dbecff;
          }
        }
      }
    }
  }

  // 对话视图样式
  .chat-view {
    .chat-container {
      min-height: 300px;
      max-height: calc(100vh - 220px);
      overflow-y: auto;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);

      .message-timeline {
        .timeline-message {
          margin-bottom: 24px;
          position: relative;

          &.highlight {
            .message-bubble {
              border: 2px solid #409EFF;
              background: #ecf5ff;
            }
          }

          &.user {
            .message-bubble {
              background: #ecf5ff;
              margin-left: 40px;
              border-radius: 12px 12px 0 12px;

              &:before {
                border-right-color: #ecf5ff;
              }
            }
          }

          &.system {
            .message-bubble {
              background: #f0f9eb;
              margin-left: 40px;
              border-radius: 12px 12px 12px 0;

              &:before {
                border-right-color: #f0f9eb;
              }
            }
          }

          &.admin {
            .message-bubble {
              background: #fdf6ec;
              margin-left: 40px;
              border-radius: 12px 12px 12px 0;

              &:before {
                border-right-color: #fdf6ec;
              }
            }
          }

          .message-info {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            gap: 10px;

            .message-id {
              font-size: 13px;
              color: #909399;
            }

            .chat-id {
              font-size: 13px;
              color: #409EFF;
              cursor: pointer;
              font-weight: 500;

              &:hover {
                text-decoration: underline;
              }
            }

            .time {
              font-size: 12px;
              color: #909399;
              margin-left: auto;
            }
          }

          .message-bubble {
            padding: 16px;
            color: #303133;
            font-size: 14px;
            line-height: 1.7;
            white-space: pre-wrap;
            word-break: break-word;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            cursor: pointer;
            position: relative;

            &:hover {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            &:before {
              content: '';
              position: absolute;
              top: 16px;
              left: -8px;
              width: 0;
              height: 0;
              border-top: 8px solid transparent;
              border-bottom: 8px solid transparent;
              border-right: 8px solid;
            }
          }

          .message-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;

            .el-button {
              color: #409EFF;
            }
          }
        }
      }
    }
  }

  .load-more-status {
    text-align: center;
    color: #909399;
    padding: 16px 0;
    font-size: 14px;
  }

  .no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px 0;
    background: white;
    border-radius: 12px;
    min-height: 300px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }
}

// 详情对话框样式
.detail-dialog {
  .detail-container {
    .detail-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;

      .meta-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;

        .meta-item {
          display: flex;
          align-items: center;

          label {
            color: #909399;
            margin-right: 8px;
            width: 70px;
          }

          span {
            color: #303133;
          }
        }
      }
    }

    .detail-content {
      h4 {
        margin: 0 0 12px;
        color: #606266;
        font-size: 16px;
      }

      .content-box {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        min-height: 100px;
        max-height: 400px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-break: break-word;
        line-height: 1.7;
        color: #303133;
        font-size: 14px;
      }
    }
  }
}

// 上下文对话框样式
.context-dialog {
  .context-container {
    min-height: 200px;

    .context-header {
      margin-bottom: 20px;

      .context-info {
        display: flex;
        justify-content: space-between;

        .chat-id {
          font-weight: 600;
          color: #303133;
        }

        .message-count {
          color: #909399;
        }
      }
    }

    .message-timeline {
      .timeline-message {
        margin-bottom: 24px;
        max-width: 80%;

        &.user {
          margin-left: auto;

          .message-body {
            background: #ecf5ff;
            border-radius: 12px 12px 0 12px;
          }
        }

        &.system {
          margin-right: auto;

          .message-body {
            background: #f0f9eb;
            border-radius: 12px 12px 12px 0;
          }
        }

        &.admin {
          margin-right: auto;

          .message-body {
            background: #fdf6ec;
            border-radius: 12px 12px 12px 0;
          }
        }

        &.current {
          .message-body {
            border: 2px solid #409EFF;
            box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
          }
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;

          .message-role {
            font-size: 13px;
            font-weight: 600;
            color: #606266;
          }

          .message-time {
            font-size: 12px;
            color: #909399;
          }
        }

        .message-body {
          padding: 14px;
          color: #303133;
          font-size: 14px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
      }
    }

    .no-context {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 0;
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .app-container {
    padding: 16px;

    .search-section {
      padding: 16px;
    }

    .view-control-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .search-result {
        width: 100%;

        .el-tag {
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
      }
    }

    .detail-dialog {
      .detail-container {
        .detail-header {
          flex-direction: column;
          gap: 16px;

          .meta-info {
            grid-template-columns: 1fr;
          }
        }
      }
    }
  }
  /* 用户名样式 */
  .user-name {
    font-size: 12px;
    color: #606266;
    margin-left: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .message-user {
    font-size: 12px;
    color: #606266;
    margin-left: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  /* 卡片视图中的用户名样式 */
  .card-header .user-name {
    margin-left: auto;
    font-size: 12px;
    color: #606266;
  }

}
</style>
