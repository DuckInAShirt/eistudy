<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="所属试卷ID" prop="paperId">
        <el-input
          v-model="queryParams.paperId"
          placeholder="请输入所属试卷ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="题号" prop="questionNumber">
        <el-input
          v-model="queryParams.questionNumber"
          placeholder="请输入题号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="题目分值" prop="score">
        <el-input
          v-model="queryParams.score"
          placeholder="请输入题目分值"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="知识点" prop="knowledgePoint">
        <el-input
          v-model="queryParams.knowledgePoint"
          placeholder="请输入知识点"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:question:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:question:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:question:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:question:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="questionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="题目ID" align="center" prop="id" />
      <el-table-column label="所属试卷ID" align="center" prop="paperId" />
      <el-table-column label="题目类型：single-单选题，multiple-多选题，fill-填空题，essay-简答题，coding-编程题" align="center" prop="questionType" />
      <el-table-column label="题号" align="center" prop="questionNumber" />
      <el-table-column label="题干内容" align="center" prop="questionContent" />
      <el-table-column label="选项内容" align="center" prop="options" />
      <el-table-column label="题目分值" align="center" prop="score" />
      <el-table-column label="题目解析" align="center" prop="analysis" />
      <el-table-column label="知识点" align="center" prop="knowledgePoint" />
      <el-table-column label="评分标准" align="center" prop="scoringCriteria" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:question:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:question:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改试卷题目对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属试卷ID" prop="paperId">
          <el-input v-model="form.paperId" placeholder="请输入所属试卷ID" />
        </el-form-item>
        <el-form-item label="题号" prop="questionNumber">
          <el-input v-model="form.questionNumber" placeholder="请输入题号" />
        </el-form-item>
        <el-form-item label="题干内容">
          <editor v-model="form.questionContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="选项内容" prop="options">
          <el-input v-model="form.options" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="题目分值" prop="score">
          <el-input v-model="form.score" placeholder="请输入题目分值" />
        </el-form-item>
        <el-form-item label="题目解析" prop="analysis">
          <el-input v-model="form.analysis" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="知识点" prop="knowledgePoint">
          <el-input v-model="form.knowledgePoint" placeholder="请输入知识点" />
        </el-form-item>
        <el-form-item label="评分标准" prop="scoringCriteria">
          <el-input v-model="form.scoringCriteria" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listQuestion, getQuestion, delQuestion, addQuestion, updateQuestion } from "@/api/system/question";

export default {
  name: "Question",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 试卷题目表格数据
      questionList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        paperId: null,
        questionType: null,
        questionNumber: null,
        questionContent: null,
        options: null,
        score: null,
        analysis: null,
        knowledgePoint: null,
        scoringCriteria: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        paperId: [
          { required: true, message: "所属试卷ID不能为空", trigger: "blur" }
        ],
        questionType: [
          { required: true, message: "题目类型：single-单选题，multiple-多选题，fill-填空题，essay-简答题，coding-编程题不能为空", trigger: "change" }
        ],
        questionNumber: [
          { required: true, message: "题号不能为空", trigger: "blur" }
        ],
        questionContent: [
          { required: true, message: "题干内容不能为空", trigger: "blur" }
        ],
        score: [
          { required: true, message: "题目分值不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询试卷题目列表 */
    getList() {
      this.loading = true;
      listQuestion(this.queryParams).then(response => {
        this.questionList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        paperId: null,
        questionType: null,
        questionNumber: null,
        questionContent: null,
        options: null,
        score: null,
        analysis: null,
        knowledgePoint: null,
        scoringCriteria: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加试卷题目";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getQuestion(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改试卷题目";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateQuestion(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addQuestion(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除试卷题目编号为"' + ids + '"的数据项？').then(function() {
        return delQuestion(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/question/export', {
        ...this.queryParams
      }, `question_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
