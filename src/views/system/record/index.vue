<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="试卷ID" prop="paperId">
        <el-input
          v-model="queryParams.paperId"
          placeholder="请输入试卷ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="学生ID" prop="studentId">
        <el-input
          v-model="queryParams.studentId"
          placeholder="请输入学生ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="题目ID" prop="questionId">
        <el-input
          v-model="queryParams.questionId"
          placeholder="请输入题目ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="得分" prop="score">
        <el-input
          v-model="queryParams.score"
          placeholder="请输入得分"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否正确：1-正确，0-错误，NULL-未评分" prop="isCorrect">
        <el-input
          v-model="queryParams.isCorrect"
          placeholder="请输入是否正确：1-正确，0-错误，NULL-未评分"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="提交时间" prop="submitTime">
        <el-date-picker clearable
          v-model="queryParams.submitTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择提交时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="评分人" prop="gradedBy">
        <el-input
          v-model="queryParams.gradedBy"
          placeholder="请输入评分人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评分时间" prop="gradeTime">
        <el-date-picker clearable
          v-model="queryParams.gradeTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择评分时间">
        </el-date-picker>
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
          v-hasPermi="['system:record:add']"
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
          v-hasPermi="['system:record:edit']"
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
          v-hasPermi="['system:record:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:record:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="记录ID" align="center" prop="id" />
      <el-table-column label="试卷ID" align="center" prop="paperId" />
      <el-table-column label="学生ID" align="center" prop="studentId" />
      <el-table-column label="题目ID" align="center" prop="questionId" />
      <el-table-column label="学生答案" align="center" prop="studentAnswer" />
      <el-table-column label="得分" align="center" prop="score" />
      <el-table-column label="是否正确：1-正确，0-错误，NULL-未评分" align="center" prop="isCorrect" />
      <el-table-column label="评语" align="center" prop="comment" />
      <el-table-column label="提交时间" align="center" prop="submitTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.submitTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评分人" align="center" prop="gradedBy" />
      <el-table-column label="评分时间" align="center" prop="gradeTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.gradeTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:record:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:record:remove']"
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

    <!-- 添加或修改学生答题记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="试卷ID" prop="paperId">
          <el-input v-model="form.paperId" placeholder="请输入试卷ID" />
        </el-form-item>
        <el-form-item label="学生ID" prop="studentId">
          <el-input v-model="form.studentId" placeholder="请输入学生ID" />
        </el-form-item>
        <el-form-item label="题目ID" prop="questionId">
          <el-input v-model="form.questionId" placeholder="请输入题目ID" />
        </el-form-item>
        <el-form-item label="学生答案" prop="studentAnswer">
          <el-input v-model="form.studentAnswer" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="得分" prop="score">
          <el-input v-model="form.score" placeholder="请输入得分" />
        </el-form-item>
        <el-form-item label="是否正确：1-正确，0-错误，NULL-未评分" prop="isCorrect">
          <el-input v-model="form.isCorrect" placeholder="请输入是否正确：1-正确，0-错误，NULL-未评分" />
        </el-form-item>
        <el-form-item label="评语" prop="comment">
          <el-input v-model="form.comment" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="提交时间" prop="submitTime">
          <el-date-picker clearable
            v-model="form.submitTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择提交时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="评分人" prop="gradedBy">
          <el-input v-model="form.gradedBy" placeholder="请输入评分人" />
        </el-form-item>
        <el-form-item label="评分时间" prop="gradeTime">
          <el-date-picker clearable
            v-model="form.gradeTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择评分时间">
          </el-date-picker>
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
import { listRecord, getRecord, delRecord, addRecord, updateRecord } from "@/api/system/record";

export default {
  name: "Record",
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
      // 学生答题记录表格数据
      recordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        paperId: null,
        studentId: null,
        questionId: null,
        studentAnswer: null,
        score: null,
        isCorrect: null,
        comment: null,
        submitTime: null,
        gradedBy: null,
        gradeTime: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        paperId: [
          { required: true, message: "试卷ID不能为空", trigger: "blur" }
        ],
        studentId: [
          { required: true, message: "学生ID不能为空", trigger: "blur" }
        ],
        questionId: [
          { required: true, message: "题目ID不能为空", trigger: "blur" }
        ],
        submitTime: [
          { required: true, message: "提交时间不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询学生答题记录列表 */
    getList() {
      this.loading = true;
      listRecord(this.queryParams).then(response => {
        this.recordList = response.rows;
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
        studentId: null,
        questionId: null,
        studentAnswer: null,
        score: null,
        isCorrect: null,
        comment: null,
        submitTime: null,
        gradedBy: null,
        gradeTime: null
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
      this.title = "添加学生答题记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getRecord(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改学生答题记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRecord(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRecord(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除学生答题记录编号为"' + ids + '"的数据项？').then(function() {
        return delRecord(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/record/export', {
        ...this.queryParams
      }, `record_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
