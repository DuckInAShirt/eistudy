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
          user_id: '2024522001',
          user_name: '李阳',
          question_id: 101,
          user_answer: 'B',
          is_correct: 1,
          score: 5,
          answer_time: 32,
          submit_time: '2025-12-10 09:12:01'
        },
        {
          id: 2,
          user_id: '2024522002',
          user_name: '张涵',
          question_id: 102,
          user_answer: 'A',
          is_correct: 0,
          score: 0,
          answer_time: 45,
          submit_time: '2025-12-10 09:18:44'
        },
        {
          user_id: '2024522003',
          user_name: '徐泽轩',
          id: 3,
          question_id: 103,
          user_answer: 'C',
          is_correct: 1,
          score: 5,
          answer_time: 28,
          submit_time: '2025-12-10 09:25:03'
        },
        {
          user_id: '2024522004',
          user_name: '王嘉睿',
          id: 4,
          question_id: 104,
          user_answer: 'D',
          is_correct: 1,
          score: 5,
          answer_time: 36,
          submit_time: '2025-12-10 09:32:18'
        },
        {
          user_id: '2024522005',
          user_name: '盖炳灿',
          id: 5,
          question_id: 105,
          user_answer: 'A',
          is_correct: 0,
          score: 0,
          answer_time: 51,
          submit_time: '2025-12-10 09:40:55'
        },
        {
          user_id: '2024522006',
          user_name: '屈锦程',
          id: 6,
          question_id: 106,
          user_answer: 'B',
          is_correct: 1,
          score: 5,
          answer_time: 30,
          submit_time: '2025-12-10 09:48:37'
        },
        {
          user_id: '2024522007',
          user_name: '杨家宝',
          id: 7,
          question_id: 107,
          user_answer: 'C',
          is_correct: 1,
          score: 5,
          answer_time: 33,
          submit_time: '2025-12-10 09:55:10'
        },
        {
          user_id: '2024522008',
          user_name: '邢熠尧',
          id: 8,
          question_id: 108,
          user_answer: 'D',
          is_correct: 0,
          score: 0,
          answer_time: 29,
          submit_time: '2025-12-10 10:01:51'
        },
        {
          user_id: '2024522009',
          user_name: '晏宇',
          id: 9,
          question_id: 109,
          user_answer: 'A',
          is_correct: 1,
          score: 5,
          answer_time: 27,
          submit_time: '2025-12-10 10:08:13'
        },
        {
          user_id: '2024522010',
          user_name: '杜咏庭',
          id: 10,
          question_id: 110,
          user_answer: 'B',
          is_correct: 1,
          score: 5,
          answer_time: 34,
          submit_time: '2025-12-10 10:15:42'
        }
      ],
      masteryData: [
        { user_name: '张雷', course: '电路分析基础', knowledge_point: '集总参数电路模型', mastery: 92, level: '优秀' },
        { user_name: '张雷', course: '电路分析基础', knowledge_point: '基尔霍夫定律应用', mastery: 85, level: '优秀' },
        { user_name: '张雷', course: '电路分析基础', knowledge_point: '正弦稳态分析', mastery: 74, level: '良好' },
        { user_name: '李晴', course: '通信原理', knowledge_point: '调制方式选择', mastery: 68, level: '良好' },
        { user_name: '李晴', course: '通信原理', knowledge_point: '误码率与信噪比', mastery: 52, level: '待提升' },
        { user_name: '赵宇', course: '微电子技术', knowledge_point: 'CMOS 反相器特性', mastery: 63, level: '良好' },
        { user_name: '孙悦', course: '信号与系统', knowledge_point: '卷积运算', mastery: 48, level: '待提升' },
        { user_name: '王晨', course: '数字信号处理', knowledge_point: 'DFT 与 FFT', mastery: 70, level: '良好' }
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