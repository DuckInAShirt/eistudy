<template>
  <div class="student-stats-container">
    <h2>学生学习情况统计</h2>
    <el-table :data="tableData" border stripe style="width: 100%; margin-top: 24px;">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="user_id" label="用户ID" width="120" />
      <el-table-column prop="user_name" label="学生姓名" width="120" />
      <el-table-column prop="question_id" label="题目ID" width="100" />
      <el-table-column prop="user_answer" label="用户答案" width="100" />
      <el-table-column prop="is_correct" label="是否正确" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.is_correct === 1 ? 'success' : 'danger'">
            {{ scope.row.is_correct === 1 ? '正确' : '错误' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="得分" width="80" />
      <el-table-column prop="answer_time" label="答题用时(秒)" width="110" />
      <el-table-column prop="submit_time" label="提交时间" width="180" />
    </el-table>

    <h2 style="margin-top:40px;">学生知识点掌握情况</h2>
    <el-table :data="masteryData" border stripe style="width: 100%; margin-top: 24px;">
      <el-table-column prop="user_name" label="学生姓名" width="120" />
      <el-table-column prop="course" label="课程" width="160" />
      <el-table-column prop="knowledge_point" label="知识点" min-width="180" />
      <el-table-column prop="mastery" label="掌握情况" width="120">
        <template slot-scope="scope">
          <el-progress :percentage="scope.row.mastery" :status="scope.row.mastery >= 80 ? 'success' : (scope.row.mastery >= 60 ? 'warning' : 'exception')" style="width:90px"/>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="等级" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.level === '优秀' ? 'success' : (scope.row.level === '良好' ? 'warning' : 'danger')">
            {{ scope.row.level }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'StudentStats',
  data() {
    return {
      tableData: [
        {
          id: 1,
          user_id: 1001,
          user_name: '张三',
          question_id: 3,
          user_answer: 'A',
          is_correct: 1,
          score: 5,
          answer_time: 32,
          submit_time: '2024-07-12 10:12:01'
        },
        {
          id: 2,
          user_id: 1002,
          user_name: '李四',
          question_id: 4,
          user_answer: 'B',
          is_correct: 0,
          score: 0,
          answer_time: 45,
          submit_time: '2024-07-12 10:13:22'
        },
        {
          id: 3,
          user_id: 1001,
          user_name: '张三',
          question_id: 4,
          user_answer: 'D',
          is_correct: 1,
          score: 5,
          answer_time: 28,
          submit_time: '2024-07-12 10:15:10'
        },
        {
          id: 4,
          user_id: 1003,
          user_name: '王五',
          question_id: 3,
          user_answer: 'C',
          is_correct: 0,
          score: 0,
          answer_time: 60,
          submit_time: '2024-07-12 10:16:05'
        }
      ],
      masteryData: [
        { user_name: '张三', course: '电路分析基础', knowledge_point: '集总参数电路模型', mastery: 95, level: '优秀' },
        { user_name: '张三', course: '电路分析基础', knowledge_point: '电路的基本变量，基尔霍夫电压定律、基尔霍夫电流定律', mastery: 80, level: '优秀' },
        { user_name: '张三', course: '电路分析基础', knowledge_point: '完备的独立电路变量', mastery: 70, level: '良好' },
        { user_name: '李四', course: '电路分析基础', knowledge_point: '集总参数电路模型', mastery: 60, level: '良好' },
        { user_name: '李四', course: '电路分析基础', knowledge_point: '电路的基本变量，基尔霍夫电压定律、基尔霍夫电流定律', mastery: 45, level: '待提升' },
        { user_name: '王五', course: '电路分析基础', knowledge_point: '集总参数电路模型', mastery: 30, level: '待提升' },
        { user_name: '王五', course: '电路分析基础', knowledge_point: '完备的独立电路变量', mastery: 55, level: '待提升' }
      ]
    }
  },
  methods: {
    openQA(appId) {
      // Dify官方SaaS为例，带上apikey参数
      window.open(`https://cloud.dify.ai/app/${appId}?api_key=${appId}`, '_blank');
    }
  }
}
</script>

<style scoped>
.student-stats-container {
  max-width: 900px;
  margin: 40px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(52,152,219,0.10);
  padding: 32px 24px;
}
h2 {
  text-align: center;
  color: #3498db;
  font-weight: 700;
  margin-bottom: 12px;
}
</style> 