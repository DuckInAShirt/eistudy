<template>
  <div class="dashboard-wrapper">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
      <div class="geometric-shape shape-1"></div>
      <div class="geometric-shape shape-2"></div>
      <div class="geometric-shape shape-3"></div>
      <div class="geometric-shape shape-4"></div>
    </div>

    <!-- Premium Header -->
    <header class="premium-header">
      <div class="logo-area">
        <div class="logo-icon">
          <i class="el-icon-s-platform"></i>
        </div>
        <div class="logo-text">
          <h1>问答情况 <span>分析平台</span></h1>
        </div>
      </div>
<!--      <div class="header-tabs">-->
<!--        <div class="tab active">-->
<!--          <i class="el-icon-data-analysis"></i>-->
<!--          <span>数据分析</span>-->
<!--        </div>-->
<!--      </div>-->
      <div class="header-actions">
        <el-tooltip content="刷新数据" placement="bottom" effect="light">
          <el-button
            type="primary"
            plain
            size="small"
            class="action-btn refresh-btn"
            @click="refreshData"
            :loading="isLoading"
          >
            <i class="el-icon-refresh"></i>
            <span>刷新数据</span>
          </el-button>
        </el-tooltip>
        <el-tooltip content="处理历史数据" placement="bottom" effect="light">
          <el-button
            type="warning"
            plain
            size="small"
            class="action-btn process-btn"
            @click="processHistoryData"
            :loading="processingHistory"
          >
            <i class="el-icon-s-operation"></i>
            <span>处理历史</span>
          </el-button>
        </el-tooltip>
<!--        <el-dropdown trigger="click" @command="handleCommand">-->
<!--          <el-button type="info" plain size="small" class="action-btn">-->
<!--            <i class="el-icon-more"></i>-->
<!--          </el-button>-->
<!--          <el-dropdown-menu slot="dropdown">-->
<!--            <el-dropdown-item command="exportData">-->
<!--              <i class="el-icon-download"></i> 导出数据-->
<!--            </el-dropdown-item>-->
<!--            <el-dropdown-item command="settings">-->
<!--              <i class="el-icon-setting"></i> 设置-->
<!--            </el-dropdown-item>-->
<!--            <el-dropdown-item command="help">-->
<!--              <i class="el-icon-question"></i> 帮助-->
<!--            </el-dropdown-item>-->
<!--          </el-dropdown-menu>-->
<!--        </el-dropdown>-->
      </div>
    </header>

    <!-- Main Dashboard Content -->
    <main class="dashboard-content" v-loading.fullscreen.lock="isFullscreenLoading">
      <!-- Top Stats Row -->
      <div class="stats-overview">
        <div
          class="stat-card"
          v-for="(stat, index) in statsData"
          :key="index"
          :class="`stat-card-${index+1}`"
          @mouseenter="onStatHover(index)"
          @mouseleave="onStatLeave(index)"
        >
          <div class="stat-icon-wrapper">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              <count-to
                :start-val="0"
                :end-val="stat.value"
                :duration="2000"
                :decimals="0"
                separator=","
                ref="countTo"
              ></count-to>
            </div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend" v-if="stat.trend !== undefined">
              <i :class="stat.trend > 0 ? 'el-icon-top' : stat.trend < 0 ? 'el-icon-bottom' : 'el-icon-minus'"></i>
              <span :class="stat.trend > 0 ? 'trend-up' : stat.trend < 0 ? 'trend-down' : 'trend-neutral'">
                {{ Math.abs(stat.trend) }}%
              </span>
            </div>
          </div>
          <div class="stat-chart">
            <div class="sparkline" :id="`sparkline-${index}`"></div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Left Column -->
        <div class="dashboard-column left-column">
          <!-- Question Types Chart -->
          <div class="dashboard-panel question-types-panel">
            <div class="panel-header">
              <h3><i class="el-icon-pie-chart"></i> 问题类型分布</h3>
              <div class="panel-actions">
                <el-tooltip content="查看详情" placement="top">
                  <i class="el-icon-full-screen action-icon"></i>
                </el-tooltip>
              </div>
            </div>
            <div class="panel-body">
              <div ref="questionTypeChart" class="chart-container"></div>
            </div>
          </div>

          <!-- Complexity Distribution -->
          <div class="dashboard-panel complexity-panel">
            <div class="panel-header">
              <h3><i class="el-icon-data-analysis"></i> 问题复杂度分布</h3>
              <div class="panel-actions">
                <el-tooltip content="查看详情" placement="top">
                  <i class="el-icon-full-screen action-icon"></i>
                </el-tooltip>
              </div>
            </div>
            <div class="panel-body">
              <div ref="complexityChart" class="chart-container"></div>
            </div>
          </div>
        </div>

        <!-- Center Column -->
        <div class="dashboard-column center-column">
          <!-- Daily Trend Chart -->
          <div class="dashboard-panel trend-panel">
            <div class="panel-header">
              <h3><i class="el-icon-trend-charts"></i> 提问趋势分析</h3>
              <div class="panel-actions">
<!--                <el-radio-group v-model="trendTimeRange" size="mini">-->
<!--                  <el-radio-button label="7">7天</el-radio-button>-->
<!--                  <el-radio-button label="14">14天</el-radio-button>-->
<!--                  <el-radio-button label="30">30天</el-radio-button>-->
<!--                </el-radio-group>-->
              </div>
            </div>
            <div class="panel-body">
              <div ref="dailyTrendChart" class="chart-container"></div>
            </div>
          </div>

          <!-- Subject Distribution -->
          <div class="dashboard-panel subjects-panel">
            <div class="panel-header">
              <h3><i class="el-icon-collection-tag"></i> 学科分布</h3>
              <div class="panel-actions">
                <el-tooltip content="查看详情" placement="top">
                  <i class="el-icon-full-screen action-icon"></i>
                </el-tooltip>
              </div>
            </div>
            <div class="panel-body">
              <div ref="subjectChart" class="chart-container"></div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="dashboard-column right-column">
          <!-- Active Students -->
          <div class="dashboard-panel students-panel">
            <div class="panel-header">
              <h3><i class="el-icon-user"></i> 活跃学生</h3>
              <div class="panel-actions">
                <el-tooltip content="查看全部" placement="top">
                  <i class="el-icon-more action-icon"></i>
                </el-tooltip>
              </div>
            </div>
            <div class="panel-body">
              <div class="student-list">
                <div
                  v-for="(student, index) in activeStudents"
                  :key="student.userName"
                  class="student-item"
                  :class="{ 'top-student': index === 0 }"
                  @click="showStudentProfile(student.userName)"
                >
                  <div class="student-avatar" :style="{ background: getAvatarGradient(index) }">
                    {{ student.userName.charAt(0) }}
                  </div>
                  <div class="student-info">
                    <div class="student-name">{{ student.userName }}</div>
                    <div class="student-subject">{{ student.mainSubject }}</div>
                  </div>
                  <div class="student-stats">
                    <div class="student-questions">
                      <i class="el-icon-chat-dot-round"></i>
                      <span>{{ student.totalQuestions }}</span>
                    </div>
                    <div class="student-score">
                      <el-progress
                        :percentage="student.learningScore"
                        :color="getLearningScoreColor(student.learningScore)"
                        :stroke-width="4"
                        :show-text="false"
                      ></el-progress>
                      <span>{{ student.learningScore }}分</span>
                    </div>
                  </div>
                </div>
                <div v-if="activeStudents.length === 0" class="no-data">
                  <i class="el-icon-user"></i>
                  <span>暂无活跃学生数据</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Hot Keywords -->
          <div class="dashboard-panel keywords-panel">
            <div class="panel-header">
              <h3><i class="el-icon-collection-tag"></i> 热门关键词</h3>
              <div class="panel-actions">
                <el-tooltip content="查看全部" placement="top">
                  <i class="el-icon-more action-icon"></i>
                </el-tooltip>
              </div>
            </div>
            <div class="panel-body">
              <div class="keywords-cloud">
                <div
                  v-for="(keyword, index) in hotKeywords"
                  :key="keyword.keyword"
                  class="keyword-item"
                  :style="{
                    fontSize: getTagSize(keyword.frequency) + 'px',
                    opacity: 0.7 + (keyword.frequency / 100) * 0.3,
                    animationDelay: `${index * 0.1}s`,
                    background: getKeywordBackground(index, keyword.frequency)
                  }"
                  @mouseenter="onKeywordHover"
                  @mouseleave="onKeywordLeave"
                >
                  {{ keyword.keyword }}
                  <span class="keyword-count">{{ keyword.frequency }}</span>
                </div>
                <div v-if="hotKeywords.length === 0" class="no-data">
                  <i class="el-icon-collection-tag"></i>
                  <span>暂无关键词数据</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Action Button -->
      <div class="floating-action-btn" @click="showStudentSearch = true">
        <i class="el-icon-search"></i>
      </div>
    </main>

    <!-- Student Search Dialog -->
    <el-dialog
      title="学生学情画像查询"
      :visible.sync="showStudentSearch"
      width="80%"
      class="student-search-dialog"
      :destroy-on-close="true"
      :append-to-body="true"
    >
      <div class="search-form">
        <el-input
          v-model="profileForm.userName"
          placeholder="请输入学生用户名"
          prefix-icon="el-icon-search"
          clearable
        >
          <el-button slot="append" type="primary" @click="searchStudentProfile" :loading="searchingProfile">查询</el-button>
        </el-input>
      </div>

      <div v-if="studentProfile.userName" class="student-profile">
        <div class="profile-header">
          <div class="profile-avatar">
            {{ studentProfile.userName.charAt(0) }}
          </div>
          <div class="profile-title">
            <h2>{{ studentProfile.userName }} 的学习画像</h2>
            <div class="profile-status" :class="getStatusClass(studentProfile.learningStatus)">
              {{ studentProfile.learningStatus }}
            </div>
          </div>
        </div>

        <div class="profile-content">
          <div class="profile-stats">
            <div class="profile-stat-card">
              <div class="stat-icon">
                <i class="el-icon-chat-dot-round"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ studentProfile.totalQuestions }}</div>
                <div class="stat-label">总提问数</div>
              </div>
            </div>
            <div class="profile-stat-card">
              <div class="stat-icon">
                <i class="el-icon-collection-tag"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ studentProfile.mainSubject }}</div>
                <div class="stat-label">主要学科</div>
              </div>
            </div>
            <div class="profile-stat-card">
              <div class="stat-icon">
                <i class="el-icon-date"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ studentProfile.lastActiveTime }}</div>
                <div class="stat-label">最后活跃</div>
              </div>
            </div>
          </div>

          <div class="profile-charts">
            <div class="profile-chart-container">
              <h3>问题复杂度分布</h3>
              <div ref="studentComplexityChart" class="profile-chart"></div>
            </div>
            <div class="profile-chart-container">
              <h3>学习进度分析</h3>
              <div class="learning-progress">
                <div class="progress-item" v-for="(item, index) in learningProgressItems" :key="index">
                  <div class="progress-label">
                    <span>{{ item.label }}</span>
                    <span>{{ item.value }}%</span>
                  </div>
                  <el-progress
                    :percentage="item.value"
                    :color="item.color"
                    :stroke-width="8"
                  ></el-progress>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-recommendations">
            <h3>学习建议</h3>
            <div class="recommendation-list">
              <div class="recommendation-item" v-for="(item, index) in recommendationItems" :key="index">
                <div class="recommendation-icon">
                  <i :class="item.icon"></i>
                </div>
                <div class="recommendation-content">
                  <div class="recommendation-title">{{ item.title }}</div>
                  <div class="recommendation-desc">{{ item.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="profileSearched" class="no-profile-data">
        <i class="el-icon-warning-outline"></i>
        <h3>未找到学生数据</h3>
        <p>请检查用户名是否正确，或尝试搜索其他学生</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import CountTo from 'vue-count-to';
import {
  getStatistics,
  getQuestionTypes,
  getSubjects,
  getComplexityDistribution,
  getDailyTrend,
  getHotKeywords,
  getActiveStudents,
  getStudentProfile,
  processHistoryData
} from '@/api/analyse/dashboard';

export default {
  name: "PremiumDashboard",
  components: {
    CountTo
  },
  data() {
    return {
      // 统计数据
      statistics: {
        totalQuestions: 0,
        totalStudents: 0,
        totalSubjects: 0,
        todayQuestions: 0
      },
      // 问题类型统计
      questionTypes: [],
      // 学科分布
      subjects: [],
      // 复杂度分布
      complexityData: {
        simple: 0,
        medium: 0,
        complex: 0
      },
      // 每日提问趋势
      dailyTrend: [],
      // 热门关键词
      hotKeywords: [],
      // 活跃学生
      activeStudents: [],
      // 学生画像查询表单
      profileForm: {
        userName: ''
      },
      // 学生画像数据
      studentProfile: {},
      // 是否已查询
      profileSearched: false,
      // 图表实例
      charts: {
        questionTypeChart: null,
        subjectChart: null,
        complexityChart: null,
        dailyTrendChart: null,
        studentComplexityChart: null,
        sparklines: []
      },
      // 状态控制
      processingHistory: false,
      isLoading: false,
      isFullscreenLoading: false,
      showStudentSearch: false,
      searchingProfile: false,
      trendTimeRange: '14',
      // 颜色方案
      chartColors: [
        '#4361ee', '#3a86ff', '#4cc9f0', '#4895ef',
        '#560bad', '#7209b7', '#b5179e', '#f72585',
        '#f94144', '#f3722c', '#f8961e', '#f9c74f',
        '#90be6d', '#43aa8b', '#4d908e', '#577590'
      ],
      // 学习进度模拟数据（实际应用中应从API获取）
      learningProgressItems: [],
      // 学习建议模拟数据
      recommendationItems: [],
      // 动画控制
      hoveredStatIndex: null,
      // 趋势数据（模拟）
      trendData: [
        [10, 15, 20, 25, 23, 30, 35],
        [50, 45, 60, 70, 65, 75, 80],
        [12, 12, 12, 12, 13, 13, 12],
        [5, 10, 8, 15, 20, 25, 30]
      ]
    };
  },
  computed: {
    statsData() {
      return [
        {
          label: '总提问数',
          value: this.statistics.totalQuestions || 0,
          icon: 'el-icon-chat-dot-round',
          trend: 12, // 模拟数据，实际应从API获取
          trendData: this.trendData[0]
        },
        {
          label: '参与学生',
          value: this.statistics.totalStudents || 0,
          icon: 'el-icon-user',
          trend: 8,
          trendData: this.trendData[1]
        },
        {
          label: '学科分类',
          value: this.statistics.totalSubjects || 0,
          icon: 'el-icon-collection-tag',
          trend: 0,
          trendData: this.trendData[2]
        },
        {
          label: '今日提问',
          value: this.statistics.todayQuestions || 0,
          icon: 'el-icon-s-opportunity',
          trend: -5,
          trendData: this.trendData[3]
        }
      ];
    }
  },
  created() {
    this.getDashboardData();
  },
  mounted() {
    // 窗口大小变化时重新调整图表大小
    window.addEventListener('resize', this.resizeCharts);

    // 初始化动画
    this.initAnimations();

    // 初始化迷你趋势图
    this.$nextTick(() => {
      this.initSparklines();
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts);
    // 销毁图表实例
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        if (Array.isArray(this.charts[key])) {
          this.charts[key].forEach(chart => {
            if (chart) chart.dispose();
          });
        } else {
          this.charts[key].dispose();
        }
      }
    });
  },
  methods: {
    // 初始化动画
    initAnimations() {
      // 触发数字计数动画
      if (this.$refs.countTo) {
        if (Array.isArray(this.$refs.countTo)) {
          this.$refs.countTo.forEach(item => {
            item.start();
          });
        }
      }
    },

    // 初始化迷你趋势图
    initSparklines() {
      this.charts.sparklines = [];

      this.statsData.forEach((stat, index) => {
        const sparklineEl = document.getElementById(`sparkline-${index}`);
        if (sparklineEl) {
          const sparkline = echarts.init(sparklineEl);

          const option = {
            grid: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            },
            xAxis: {
              type: 'category',
              show: false,
              boundaryGap: false
            },
            yAxis: {
              type: 'value',
              show: false,
              min: 'dataMin'
            },
            series: [{
              type: 'line',
              data: stat.trendData,
              showSymbol: false,
              symbol: 'circle',
              symbolSize: 2,
              lineStyle: {
                width: 2,
                color: this.getSparklineColor(index, stat.trend)
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: this.getSparklineColor(index, stat.trend, 0.2) },
                  { offset: 1, color: this.getSparklineColor(index, stat.trend, 0.02) }
                ])
              },
              smooth: true
            }]
          };

          sparkline.setOption(option);
          this.charts.sparklines.push(sparkline);
        }
      });
    },

    // 获取迷你趋势图颜色
    getSparklineColor(index, trend, alpha = 1) {
      let baseColor;

      if (trend > 0) {
        baseColor = '#4caf50'; // 上升趋势 - 绿色
      } else if (trend < 0) {
        baseColor = '#f44336'; // 下降趋势 - 红色
      } else {
        baseColor = '#2196f3'; // 持平趋势 - 蓝色
      }

      if (alpha === 1) return baseColor;

      // 转换为rgba
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    // 获取头像渐变色
    getAvatarGradient(index) {
      const gradients = [
        'linear-gradient(135deg, #4361ee, #3a86ff)',
        'linear-gradient(135deg, #7209b7, #b5179e)',
        'linear-gradient(135deg, #f94144, #f3722c)',
        'linear-gradient(135deg, #43aa8b, #90be6d)',
        'linear-gradient(135deg, #f8961e, #f9c74f)'
      ];

      return gradients[index % gradients.length];
    },

    // 获取关键词背景色
    getKeywordBackground(index, frequency) {
      const colors = [
        ['#4361ee', '#3a86ff'],
        ['#7209b7', '#b5179e'],
        ['#f94144', '#f3722c'],
        ['#43aa8b', '#90be6d'],
        ['#f8961e', '#f9c74f']
      ];

      const colorPair = colors[index % colors.length];
      const intensity = Math.min(frequency / 100, 1) * 0.2 + 0.1;

      return `linear-gradient(135deg, ${colorPair[0]}${Math.round(intensity * 255).toString(16)}, ${colorPair[1]}${Math.round(intensity * 255).toString(16)})`;
    },

    // 统计卡片悬停效果
    onStatHover(index) {
      this.hoveredStatIndex = index;
    },

    onStatLeave() {
      this.hoveredStatIndex = null;
    },

    // 关键词悬停效果
    onKeywordHover(e) {
      e.currentTarget.style.transform = 'scale(1.1)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.zIndex = '10';
    },

    onKeywordLeave(e) {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '';
      e.currentTarget.style.zIndex = '';
    },

    // 下拉菜单命令处理
    handleCommand(command) {
      if (command === 'exportData') {
        this.$message({
          message: '数据导出功能即将上线',
          type: 'info'
        });
      } else if (command === 'settings') {
        this.$message({
          message: '设置功能即将上线',
          type: 'info'
        });
      } else if (command === 'help') {
        this.$message({
          message: '帮助文档即将上线',
          type: 'info'
        });
      }
    },

    // 显示学生画像
    showStudentProfile(userName) {
      this.showStudentSearch = true;
      this.profileForm.userName = userName;
      this.$nextTick(() => {
        this.searchStudentProfile();
      });
    },

    // 获取学习状态样式类
    getStatusClass(status) {
      if (status === '优秀' || status === '积极学习中') {
        return 'status-excellent';
      } else if (status === '良好') {
        return 'status-good';
      } else if (status === '需要关注') {
        return 'status-warning';
      } else {
        return 'status-normal';
      }
    },

    // 获取仪表盘数据
    getDashboardData() {
      this.isLoading = true;

      // 使用Promise.all并行获取所有数据
      Promise.all([
        this.getStatistics(),
        this.getQuestionTypes(),
        this.getSubjects(),
        this.getComplexityDistribution(),
        this.getDailyTrend(),
        this.getHotKeywords(),
        this.getActiveStudents()
      ]).then(() => {
        this.isLoading = false;
        this.initAnimations();
        this.$nextTick(() => {
          this.initSparklines();
        });
      }).catch(() => {
        this.isLoading = false;
        this.$message.error('获取数据失败，请稍后重试');
      });
    },

    // 获取基本统计数据
    getStatistics() {
      return getStatistics().then(res => {
        if (res.code === 200) {
          this.statistics = res.data || {
            totalQuestions: 0,
            totalStudents: 0,
            totalSubjects: 0,
            todayQuestions: 0
          };
          // 手动设置总提问数和参与学生数量
          this.statistics.totalQuestions = 2657; // 修改为您需要的总提问数
          this.statistics.totalStudents = 328; // 修改为您需要的参与学生数
        }
      }).catch(() => {
        this.statistics = {
          totalQuestions: 2657, // 修改为您需要的总提问数
          totalStudents: 328, // 修改为您需要的参与学生数
          totalSubjects: 0,
          todayQuestions: 0
        };
      });
    },

    // 刷新所有数据
    refreshData() {
      this.getDashboardData();
      this.$notify({
        title: '刷新成功',
        message: '数据已更新至最新状态',
        type: 'success',
        position: 'bottom-right'
      });
    },

    // 处理历史数据
    processHistoryData() {
      this.$confirm('这将处理所有历史问题数据，可能需要一些时间。是否继续?', '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.processingHistory = true;
        processHistoryData().then(res => {
          if (res.code === 200) {
            this.$notify({
              title: '处理成功',
              message: res.msg || '历史数据处理成功',
              type: 'success',
              position: 'bottom-right'
            });
            // 刷新数据以显示处理结果
            this.getDashboardData();
          } else {
            this.$message.error(res.msg || '历史数据处理失败');
          }
        }).catch(err => {
          console.error('处理历史数据出错', err);
          this.$message.error('处理历史数据出错');
        }).finally(() => {
          this.processingHistory = false;
        });
      }).catch(() => {
        this.$message.info('已取消操作');
      });
    },

    // 获取问题类型分布
    getQuestionTypes() {
      return getQuestionTypes().then(res => {
        if (res.code === 200) {
          this.questionTypes = res.data || [];
          this.$nextTick(() => {
            this.initQuestionTypeChart();
          });
        }
      }).catch(() => {
        this.questionTypes = [];
        this.$nextTick(() => {
          this.initQuestionTypeChart();
        });
      });
    },

    // 获取学科分布
    getSubjects() {
      return getSubjects().then(res => {
        if (res.code === 200) {
          this.subjects = res.data || [];
          this.$nextTick(() => {
            this.initSubjectChart();
          });
        }
      }).catch(() => {
        this.subjects = [];
        this.$nextTick(() => {
          this.initSubjectChart();
        });
      });
    },

    // 获取复杂度分布
    getComplexityDistribution() {
      return getComplexityDistribution().then(res => {
        if (res.code === 200) {
          this.complexityData = res.data || { simple: 0, medium: 0, complex: 0 };
          this.$nextTick(() => {
            this.initComplexityChart();
          });
        }
      }).catch(() => {
        this.complexityData = { simple: 0, medium: 0, complex: 0 };
        this.$nextTick(() => {
          this.initComplexityChart();
        });
      });
    },

    // 获取每日提问趋势
    getDailyTrend() {
      return getDailyTrend().then(res => {
        if (res.code === 200) {
          this.dailyTrend = res.data || [];
          this.$nextTick(() => {
            this.initDailyTrendChart();
          });
        }
      }).catch(() => {
        this.dailyTrend = [];
        this.$nextTick(() => {
          this.initDailyTrendChart();
        });
      });
    },

    // 获取热门关键词
    getHotKeywords() {
      return getHotKeywords().then(res => {
        if (res.code === 200) {
          this.hotKeywords = res.data || [];
        }
      }).catch(() => {
        this.hotKeywords = [];
      });
    },

    // 获取活跃学生
    getActiveStudents() {
      return getActiveStudents().then(res => {
        if (res.code === 200) {
          this.activeStudents = res.data || [];
        }
      }).catch(() => {
        this.activeStudents = [];
      });
    },

    // 查询学生画像
    searchStudentProfile() {
      if (!this.profileForm.userName) {
        this.$message.warning('请输入用户名');
        return;
      }

      this.searchingProfile = true;
      getStudentProfile(this.profileForm.userName).then(res => {
        this.profileSearched = true;
        if (res.code === 200 && res.data && res.data.userName) {
          this.studentProfile = res.data;

          // 使用后端返回的学习进度数据
          if (res.data.learningProgressItems && res.data.learningProgressItems.length > 0) {
            this.learningProgressItems = res.data.learningProgressItems.map(item => ({
              label: item.dimensionName,
              value: item.score,
              color: item.color || this.getLearningScoreColor(item.score)
            }));
          } else {
            // 使用默认数据作为后备
            this.learningProgressItems = [
              { label: '基础知识', value: 85, color: '#4361ee' },
              { label: '实践能力', value: 72, color: '#f72585' },
              { label: '创新思维', value: 63, color: '#f8961e' },
              { label: '团队协作', value: 90, color: '#43aa8b' }
            ];
          }

          // 使用后端返回的学习建议数据
          if (res.data.recommendationItems && res.data.recommendationItems.length > 0) {
            this.recommendationItems = res.data.recommendationItems;
          } else {
            // 使用默认数据作为后备
            this.recommendationItems = [
              {
                icon: 'el-icon-reading',
                title: '加强基础知识学习',
                description: '建议多阅读相关教材，巩固基础知识点。'
              },
              {
                icon: 'el-icon-cpu',
                title: '增加实践项目经验',
                description: '参与更多实际项目，提升编程实践能力。'
              },
              {
                icon: 'el-icon-data-line',
                title: '关注学习效率',
                description: '建议制定合理的学习计划，提高学习效率。'
              }
            ];
          }

          this.$nextTick(() => {
            this.initStudentComplexityChart();
          });
        } else {
          this.studentProfile = {};
          this.learningProgressItems = [];
          this.recommendationItems = [];
        }
      }).catch(() => {
        this.profileSearched = true;
        this.studentProfile = {};
        this.learningProgressItems = [];
        this.recommendationItems = [];
      }).finally(() => {
        this.searchingProfile = false;
      });
    }
    ,

    // 初始化问题类型图表
    initQuestionTypeChart() {
      if (this.charts.questionTypeChart) {
        this.charts.questionTypeChart.dispose();
      }
      this.charts.questionTypeChart = echarts.init(this.$refs.questionTypeChart);

      const data = this.questionTypes.length > 0 ? this.questionTypes : [
        { name: '概念解释', value: 0 },
        { name: '操作指导', value: 0 },
        { name: '原理分析', value: 0 },
        { name: '比较分析', value: 0 },
        { name: '一般提问', value: 0 }
      ];

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderColor: '#e6e6e6',
          borderWidth: 1,
          padding: [8, 12],
          textStyle: {
            color: '#333'
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          itemWidth: 10,
          itemHeight: 10,
          icon: 'circle',
          textStyle: {
            color: '#666'
          },
          data: data.map(item => item.name)
        },
        series: [
          {
            name: '问题类型',
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              }
            },
            labelLine: {
              show: false
            },
            data: data.map((item, index) => ({
              value: item.value,
              name: item.name,
              itemStyle: {
                color: this.chartColors[index % this.chartColors.length]
              }
            })),
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function(idx) {
              return Math.random() * 200;
            }
          }
        ]
      };
      this.charts.questionTypeChart.setOption(option);
    },

    // 初始化学科分布图表
    initSubjectChart() {
      if (this.charts.subjectChart) {
        this.charts.subjectChart.dispose();
      }
      this.charts.subjectChart = echarts.init(this.$refs.subjectChart);

      const data = this.subjects.length > 0 ? this.subjects : [
        { name: '编程语言', value: 0 },
        { name: '数据结构与算法', value: 0 },
        { name: '数据库', value: 0 },
        { name: 'Web开发', value: 0 },
        { name: '计算机网络', value: 0 }
      ];

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(0,0,0,0.05)'
            }
          },
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderColor: '#e6e6e6',
          borderWidth: 1,
          padding: [8, 12],
          textStyle: {
            color: '#333'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#e6e6e6'
            }
          },
          axisLabel: {
            color: '#666'
          }
        },
        yAxis: {
          type: 'category',
          data: data.map(item => item.name),
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#666'
          }
        },
        series: [
          {
            name: '提问数量',
            type: 'bar',
            data: data.map((item, index) => ({
              value: item.value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: this.chartColors[index % this.chartColors.length] },
                  { offset: 1, color: this.lightenColor(this.chartColors[index % this.chartColors.length], 30) }
                ]),
                borderRadius: [0, 4, 4, 0]
              }
            })),
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.1)',
              borderRadius: [0, 4, 4, 0]
            },
            animationDelay: function(idx) {
              return idx * 100;
            }
          }
        ],
        animationEasing: 'elasticOut'
      };
      this.charts.subjectChart.setOption(option);
    },

    // 初始化复杂度分布图表
    initComplexityChart() {
      if (this.charts.complexityChart) {
        this.charts.complexityChart.dispose();
      }
      this.charts.complexityChart = echarts.init(this.$refs.complexityChart);

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderColor: '#e6e6e6',
          borderWidth: 1,
          padding: [8, 12],
          textStyle: {
            color: '#333'
          }
        },
        legend: {
          bottom: '5%',
          left: 'center',
          icon: 'circle',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            color: '#666'
          },
          data: ['简单', '中等', '复杂']
        },
        series: [
          {
            name: '问题复杂度',
            type: 'pie',
            radius: '65%',
            center: ['50%', '45%'],
            data: [
              {
                value: this.complexityData.simple || 0,
                name: '简单',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#67C23A' },
                    { offset: 1, color: '#95EB85' }
                  ])
                }
              },
              {
                value: this.complexityData.medium || 0,
                name: '中等',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#E6A23C' },
                    { offset: 1, color: '#F8D878' }
                  ])
                }
              },
              {
                value: this.complexityData.complex || 0,
                name: '复杂',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#F56C6C' },
                    { offset: 1, color: '#FF9B9B' }
                  ])
                }
              }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              }
            },
            label: {
              formatter: '{b}: {d}%',
              fontSize: 14,
              color: '#666'
            },
            labelLine: {
              smooth: 0.2,
              lineStyle: {
                color: 'rgba(0,0,0,0.2)'
              }
            },
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function(idx) {
              return Math.random() * 200;
            }
          }
        ]
      };
      this.charts.complexityChart.setOption(option);
    },

    // 初始化每日提问趋势图表
    initDailyTrendChart() {
      if (this.charts.dailyTrendChart) {
        this.charts.dailyTrendChart.dispose();
      }
      this.charts.dailyTrendChart = echarts.init(this.$refs.dailyTrendChart);

      // 如果没有数据，创建一些默认数据
      let dates = this.dailyTrend.map(item => item.date);
      let counts = this.dailyTrend.map(item => item.count);

      if (dates.length === 0) {
        // 创建最近7天的日期作为默认数据
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          dates.push(`${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`);
          counts.push(0);
        }
      }

      // 根据选择的时间范围过滤数据
      const range = parseInt(this.trendTimeRange);
      if (dates.length > range) {
        dates = dates.slice(-range);
        counts = counts.slice(-range);
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: 'rgba(84, 112, 198, 0.5)',
              width: 1,
              type: 'solid'
            }
          },
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderColor: '#e6e6e6',
          borderWidth: 1,
          padding: [8, 12],
          textStyle: {
            color: '#333'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#666',
            formatter: function(value) {
              return value.split('-')[1];
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#e6e6e6'
            }
          },
          axisLabel: {
            color: '#666'
          }
        },
        series: [
          {
            name: '提问数量',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 3,
              color: '#4361ee'
            },
            itemStyle: {
              color: '#4361ee',
              borderWidth: 2,
              borderColor: '#fff'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(67, 97, 238, 0.5)'
                },
                {
                  offset: 1,
                  color: 'rgba(67, 97, 238, 0.05)'
                }
              ])
            },
            data: counts,
            animationDuration: 2000,
            animationEasing: 'cubicOut'
          }
        ]
      };
      this.charts.dailyTrendChart.setOption(option);
    },

    // 初始化学生复杂度分布图表
    initStudentComplexityChart() {
      if (this.charts.studentComplexityChart) {
        this.charts.studentComplexityChart.dispose();
      }
      this.charts.studentComplexityChart = echarts.init(this.$refs.studentComplexityChart);
      const complexityData = this.studentProfile.complexityDistribution || { simple: 0, medium: 0, complex: 0 };
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderColor: '#e6e6e6',
          borderWidth: 1,
          padding: [8, 12],
          textStyle: {
            color: '#333'
          }
        },
        legend: {
          bottom: '0%',
          left: 'center',
          icon: 'circle',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            color: '#666'
          },
          data: ['简单', '中等', '复杂']
        },
        series: [
          {
            name: '问题复杂度',
            type: 'pie',
            radius: ['30%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              {
                value: complexityData.simple || 0,
                name: '简单',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#67C23A' },
                    { offset: 1, color: '#95EB85' }
                  ])
                }
              },
              {
                value: complexityData.medium || 0,
                name: '中等',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#E6A23C' },
                    { offset: 1, color: '#F8D878' }
                  ])
                }
              },
              {
                value: complexityData.complex || 0,
                name: '复杂',
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#F56C6C' },
                    { offset: 1, color: '#FF9B9B' }
                  ])
                }
              }
            ],
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function(idx) {
              return Math.random() * 200;
            }
          }
        ]
      };
      this.charts.studentComplexityChart.setOption(option);
    },

    // 调整图表大小
    resizeCharts() {
      Object.keys(this.charts).forEach(key => {
        if (this.charts[key]) {
          if (Array.isArray(this.charts[key])) {
            this.charts[key].forEach(chart => {
              if (chart) chart.resize();
            });
          } else {
            this.charts[key].resize();
          }
        }
      });
    },

    // 获取标签大小
    getTagSize(frequency) {
      const min = 14;
      const max = 24;
      // 假设最大频次为100，按比例计算大小
      return min + Math.min((frequency / 100) * (max - min), max - min);
    },

    // 获取学习评分颜色
    getLearningScoreColor(score) {
      if (score >= 80) {
        return '#67C23A';
      } else if (score >= 60) {
        return '#E6A23C';
      } else {
        return '#F56C6C';
      }
    },

    // 辅助函数：颜色变亮
    lightenColor(color, percent) {
      const num = parseInt(color.replace('#', ''), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
  }
};
</script>

<style scoped lang="scss">
// 全局变量
$primary-color: #4361ee;
$secondary-color: #3a86ff;
$accent-color: #4cc9f0;
$success-color: #67C23A;
$warning-color: #E6A23C;
$danger-color: #F56C6C;
$bg-color: #f8f9fa;
$panel-bg: #ffffff;
$border-color: #e6e6e6;
$text-color: #333333;
$text-secondary: #666666;
$gradient-blue: linear-gradient(135deg, #4361ee, #3a86ff);
$gradient-purple: linear-gradient(135deg, #7209b7, #b5179e);
$gradient-green: linear-gradient(135deg, #43aa8b, #90be6d);
$gradient-orange: linear-gradient(135deg, #f8961e, #f9c74f);
$shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
$radius-sm: 6px;
$radius-md: 10px;
$radius-lg: 16px;

// 全局样式
.dashboard-wrapper {
  min-height: 100vh;
  background-color: $bg-color;
  color: $text-color;
  font-family: "PingFang SC", "Helvetica Neue", Helvetica, Arial, sans-serif;
  position: relative;
  overflow: hidden;
}

// 动画背景
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;

  .wave {
    position: absolute;
    opacity: 0.05;
    border-radius: 50%;

    &.wave-1 {
      top: -100px;
      right: -100px;
      width: 500px;
      height: 500px;
      background: $gradient-blue;
      animation: wave 25s infinite linear;
    }

    &.wave-2 {
      bottom: -150px;
      left: -150px;
      width: 700px;
      height: 700px;
      background: $gradient-purple;
      animation: wave 30s infinite linear reverse;
    }

    &.wave-3 {
      top: 50%;
      left: 50%;
      width: 600px;
      height: 600px;
      background: $gradient-green;
      transform: translate(-50%, -50%);
      animation: pulse 15s infinite ease-in-out;
    }
  }

  .geometric-shape {
    position: absolute;
    opacity: 0.03;

    &.shape-1 {
      top: 15%;
      left: 10%;
      width: 100px;
      height: 100px;
      background: $primary-color;
      transform: rotate(45deg);
      animation: float 20s infinite ease-in-out;
    }

    &.shape-2 {
      top: 70%;
      right: 15%;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: $secondary-color;
      animation: float 25s infinite ease-in-out reverse;
    }

    &.shape-3 {
      bottom: 10%;
      left: 30%;
      width: 80px;
      height: 80px;
      background: $accent-color;
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      animation: float 18s infinite ease-in-out;
    }

    &.shape-4 {
      top: 25%;
      right: 25%;
      width: 120px;
      height: 120px;
      background: $warning-color;
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
      animation: float 22s infinite ease-in-out reverse;
    }
  }

  @keyframes wave {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    25% {
      transform: translateY(-20px) rotate(5deg);
    }
    50% {
      transform: translateY(0) rotate(0deg);
    }
    75% {
      transform: translateY(20px) rotate(-5deg);
    }
  }
}

// 高级头部
.premium-header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: $panel-bg;
  box-shadow: $shadow-sm;

  .logo-area {
    display: flex;
    align-items: center;

    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: $radius-md;
      background: $gradient-blue;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      box-shadow: $shadow-md;

      i {
        font-size: 24px;
        color: white;
      }
    }

    .logo-text {
      h1 {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
        color: $text-color;

        span {
          font-weight: 300;
          opacity: 0.7;
        }
      }
    }
  }

  .header-tabs {
    display: flex;
    gap: 10px;

    .tab {
      padding: 8px 16px;
      border-radius: $radius-sm;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s ease;

      i {
        font-size: 16px;
        color: $text-secondary;
      }

      span {
        font-size: 14px;
        color: $text-secondary;
      }

      &:hover {
        background: rgba($primary-color, 0.05);

        i, span {
          color: $primary-color;
        }
      }

      &.active {
        background: rgba($primary-color, 0.1);

        i, span {
          color: $primary-color;
          font-weight: 500;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.3s ease;

      i {
        font-size: 16px;
      }

      &:hover {
        transform: translateY(-2px);
      }

      &.is-loading {
        i {
          animation: spin 1s linear infinite;
        }
      }
    }
  }
}

// 主内容区域
.dashboard-content {
  position: relative;
  z-index: 5;
  padding: 20px;
  height: calc(100vh - 70px);
  overflow-y: auto;

  /* 美化滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.15);
  }
}

// 统计概览
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  .stat-card {
    background: $panel-bg;
    border-radius: $radius-md;
    padding: 20px;
    display: flex;
    position: relative;
    overflow: hidden;
    box-shadow: $shadow-sm;
    border: 1px solid $border-color;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: $shadow-md;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      transition: all 0.3s ease;
    }

    &.stat-card-1::before {
      background: $gradient-blue;
    }

    &.stat-card-2::before {
      background: $gradient-purple;
    }

    &.stat-card-3::before {
      background: $gradient-green;
    }

    &.stat-card-4::before {
      background: $gradient-orange;
    }

    .stat-icon-wrapper {
      width: 50px;
      height: 50px;
      border-radius: $radius-md;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      background: rgba($primary-color, 0.1);

      i {
        font-size: 24px;
        color: $primary-color;
      }
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        line-height: 1.2;
        color: $text-color;
      }

      .stat-label {
        font-size: 14px;
        color: $text-secondary;
        margin-bottom: 5px;
      }

      .stat-trend {
        display: flex;
        align-items: center;
        font-size: 12px;

        i {
          margin-right: 2px;
        }

        .trend-up {
          color: $success-color;
        }

        .trend-down {
          color: $danger-color;
        }

        .trend-neutral {
          color: $text-secondary;
        }
      }
    }

    .stat-chart {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 100px;
      height: 40px;
      opacity: 0.5;
      transition: all 0.3s ease;

      .sparkline {
        width: 100%;
        height: 100%;
      }
    }

    &:hover .stat-chart {
      opacity: 1;
    }
  }
}

// 仪表盘网格
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 20px;

  .dashboard-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

// 面板样式
.dashboard-panel {
  background: $panel-bg;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: $shadow-md;
  }

  .panel-header {
    padding: 15px 20px;
    border-bottom: 1px solid $border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: 16px;
      font-weight: 500;
      margin: 0;
      color: $text-color;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        font-size: 18px;
        color: $primary-color;
      }
    }

    .panel-actions {
      display: flex;
      align-items: center;
      gap: 10px;

      .action-icon {
        font-size: 16px;
        color: $text-secondary;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          color: $primary-color;
        }
      }
    }
  }

  .panel-body {
    flex: 1;
    padding: 15px;
    display: flex;
    flex-direction: column;

    .chart-container {
      width: 100%;
      height: 100%;
      min-height: 200px;
    }
  }
}

// 学生列表
.student-list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .student-item {
    background: rgba($primary-color, 0.03);
    border-radius: $radius-sm;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba($primary-color, 0.08);
      transform: translateX(5px);
    }

    &.top-student {
      background: rgba($primary-color, 0.1);
      border-left: 3px solid $primary-color;
    }

    .student-avatar {
      width: 40px;
      height: 40px;
      border-radius: $radius-sm;
      background: $gradient-blue;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      color: white;
    }

    .student-info {
      flex: 1;

      .student-name {
        font-size: 14px;
        font-weight: 500;
        color: $text-color;
      }

      .student-subject {
        font-size: 12px;
        color: $text-secondary;
      }
    }

    .student-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 5px;

      .student-questions {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: $text-secondary;

        i {
          font-size: 14px;
          color: $primary-color;
        }
      }

      .student-score {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;

        .el-progress {
          width: 60px;
        }
      }
    }
  }
}

// 关键词云
.keywords-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px;
  height: 100%;

  .keyword-item {
    border-radius: 20px;
    padding: 6px 12px;
    display: inline-flex;
    align-items: center;
    transition: all 0.3s ease;
    cursor: pointer;
    animation: fadeIn 0.5s ease forwards;
    color: $text-color;

    &:hover {
      transform: scale(1.1) !important;
      box-shadow: $shadow-sm;
    }

    .keyword-count {
      font-size: 0.7em;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 10px;
      padding: 2px 6px;
      margin-left: 5px;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

// 浮动操作按钮
.floating-action-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: $gradient-blue;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-lg;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  i {
    font-size: 24px;
    color: white;
  }
}

// 学生画像对话框
.student-search-dialog {
  .el-dialog__header {
    background: $panel-bg;
    color: $text-color;
    border-bottom: 1px solid $border-color;
  }

  .el-dialog__body {
    background: $panel-bg;
    color: $text-color;
    padding: 20px;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .student-profile {
    .profile-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .profile-avatar {
        width: 60px;
        height: 60px;
        border-radius: $radius-md;
        background: $gradient-blue;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        color: white;
        margin-right: 15px;
      }

      .profile-title {
        h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 5px 0;
          color: $text-color;
        }

        .profile-status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;

          &.status-excellent {
            background: rgba($success-color, 0.1);
            color: $success-color;
          }

          &.status-good {
            background: rgba($warning-color, 0.1);
            color: $warning-color;
          }

          &.status-warning {
            background: rgba($danger-color, 0.1);
            color: $danger-color;
          }

          &.status-normal {
            background: rgba($text-secondary, 0.1);
            color: $text-secondary;
          }
        }
      }
    }

    .profile-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;

      .profile-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;

        .profile-stat-card {
          background: $panel-bg;
          border-radius: $radius-sm;
          padding: 15px;
          display: flex;
          align-items: center;
          border: 1px solid $border-color;
          box-shadow: $shadow-sm;

          .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: $radius-sm;
            background: rgba($primary-color, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;

            i {
              font-size: 20px;
              color: $primary-color;
            }
          }

          .stat-details {
            .stat-value {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 2px;
              color: $text-color;
            }

            .stat-label {
              font-size: 12px;
              color: $text-secondary;
            }
          }
        }
      }

      .profile-charts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;

        .profile-chart-container {
          background: $panel-bg;
          border-radius: $radius-sm;
          padding: 15px;
          border: 1px solid $border-color;
          box-shadow: $shadow-sm;

          h3 {
            font-size: 16px;
            font-weight: 500;
            margin: 0 0 15px 0;
            text-align: center;
            color: $text-color;
          }

          .profile-chart {
            height: 250px;
          }

          .learning-progress {
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding: 10px;

            .progress-item {
              .progress-label {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 14px;
                color: $text-color;
              }
            }
          }
        }
      }

      .profile-recommendations {
        background: $panel-bg;
        border-radius: $radius-sm;
        padding: 15px;
        border: 1px solid $border-color;
        box-shadow: $shadow-sm;

        h3 {
          font-size: 16px;
          font-weight: 500;
          margin: 0 0 15px 0;
          color: $text-color;
        }

        .recommendation-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .recommendation-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 10px;
            border-radius: $radius-sm;
            background: rgba($primary-color, 0.03);

            .recommendation-icon {
              width: 36px;
              height: 36px;
              border-radius: $radius-sm;
              background: rgba($primary-color, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;

              i {
                font-size: 18px;
                color: $primary-color;
              }
            }

            .recommendation-content {
              flex: 1;

              .recommendation-title {
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 4px;
                color: $text-color;
              }

              .recommendation-desc {
                font-size: 12px;
                color: $text-secondary;
                line-height: 1.5;
              }
            }
          }
        }
      }
    }
  }

  .no-profile-data {
    text-align: center;
    padding: 40px 0;

    i {
      font-size: 48px;
      color: $text-secondary;
      margin-bottom: 15px;
    }

    h3 {
      font-size: 18px;
      font-weight: 500;
      margin: 0 0 10px 0;
      color: $text-color;
    }

    p {
      font-size: 14px;
      color: $text-secondary;
      margin: 0;
    }
  }
}

// 无数据状态
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: $text-secondary;

  i {
    font-size: 24px;
    margin-bottom: 10px;
  }

  span {
    font-size: 14px;
  }
}

// 动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式调整
@media (max-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;

    .right-column {
      grid-column: span 2;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
  }
}

@media (max-width: 992px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;

    .right-column {
      grid-column: span 1;
      display: flex;
      flex-direction: column;
    }
  }

  .student-profile {
    .profile-content {
      .profile-charts {
        grid-template-columns: 1fr;
      }
    }
  }

  .header-tabs {
    display: none;
  }
}

@media (max-width: 768px) {
  .premium-header {
    .logo-text {
      h1 {
        font-size: 16px;
      }
    }

    .header-actions {
      .action-btn {
        span {
          display: none;
        }
      }
    }
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .student-profile {
    .profile-header {
      flex-direction: column;
      text-align: center;

      .profile-avatar {
        margin-right: 0;
        margin-bottom: 10px;
      }
    }

    .profile-content {
      .profile-stats {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
