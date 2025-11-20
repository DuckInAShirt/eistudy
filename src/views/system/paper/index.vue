<template>
  <div class="app-container">
    <!-- 搜索区域 - 直接使用表单，不用卡片包裹 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="试卷标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入试卷标题"
          clearable
          prefix-icon="el-icon-document"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="教师" prop="teacherId">
        <el-select v-model="queryParams.teacherId" placeholder="请选择教师" clearable style="width: 120px">
          <el-option
            v-for="item in teacherOptions"
            :key="item.userId"
            :label="item.nickName"
            :value="item.userId"
          >
            <div class="user-item">
              <el-avatar :size="24">{{ item.nickName.substr(0, 1) }}</el-avatar>
              <span style="margin-left: 8px">{{ item.nickName }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="课程" prop="classId">
        <el-select v-model="queryParams.classId" placeholder="请选择课程" clearable style="width: 120px">
          <el-option
            v-for="item in classOptions"
            :key="item.classId"
            :label="item.className"
            :value="item.classId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
          <el-option :key="0" label="未开始" :value="0" />
          <el-option :key="1" label="进行中" :value="1" />
          <el-option :key="2" label="已结束" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏区域 - 使用卡片包裹 -->
    <el-card class="toolbar-container" shadow="hover">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:paper:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:paper:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['system:paper:export']"
          >导出</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
    </el-card>

    <!-- 表格展示 -->
    <el-table v-loading="loading" :data="paperList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column label="试卷标题" align="center" prop="title" :show-overflow-tooltip="true" width="200px"/>
      <el-table-column label="教师" align="center" width="120">
        <template slot-scope="scope">
          {{ getTeacherName(scope.row.teacherId) }}
        </template>
      </el-table-column>
      <el-table-column label="课程" align="center" width="120">
        <template slot-scope="scope">
          {{ getClassName(scope.row.classId) }}
        </template>
      </el-table-column>
      <el-table-column label="总分" align="center" prop="totalScore" width="80" />
      <el-table-column label="考试时长" align="center" prop="duration" width="100">
        <template slot-scope="scope">
          {{ scope.row.duration }}分钟
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" width="170">
        <template slot-scope="scope">
          {{ parseTime(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="截止时间" align="center" width="170">
        <template slot-scope="scope">
          {{ parseTime(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >查看详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:paper:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:paper:remove']"
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

    <!-- 添加或修改试卷对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="试卷标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入试卷标题" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="教师" prop="teacherId">
              <el-select v-model="form.teacherId" placeholder="请选择教师" style="width: 100%">
                <el-option
                  v-for="item in teacherOptions"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="Number(item.userId)"
                >
                  <div class="user-item">
                    <el-avatar :size="24">{{ item.nickName.substr(0, 1) }}</el-avatar>
                    <span style="margin-left: 8px">{{ item.nickName }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程" prop="classId">
              <el-select v-model="form.classId" placeholder="请选择课程" style="width: 100%">
                <el-option
                  v-for="item in classOptions"
                  :key="item.classId"
                  :label="item.className"
                  :value="Number(item.classId)"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="总分" prop="totalScore">
              <el-input-number v-model="form.totalScore" :min="0" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考试时长" prop="duration">
              <el-input-number v-model="form.duration" :min="0" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="选择截止时间"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="试卷描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入试卷描述" />
        </el-form-item>
        <el-form-item label="AI提示词" prop="aiPrompt" v-if="form.id === null">
          <el-input v-model="form.aiPrompt" type="textarea" rows="3" placeholder="请输入AI生成试卷的提示词" />
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
import { listPaper, getPaper, delPaper, addPaper, updatePaper } from "@/api/system/paper";
import { listTeacherForClass } from "@/api/system/teacher";
import { listClass } from "@/api/system/class";

export default {
  name: "Paper",
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
      // 试卷表格数据
      paperList: [],
      // 教师选项
      teacherOptions: [],
      // 课程选项
      classOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        teacherId: null,
        classId: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          { required: true, message: "试卷标题不能为空", trigger: "blur" }
        ],
        teacherId: [
          { required: true, message: "教师不能为空", trigger: "change" }
        ],
        classId: [
          { required: true, message: "课程不能为空", trigger: "change" }
        ],
        totalScore: [
          { required: true, message: "总分不能为空", trigger: "blur" }
        ],
        duration: [
          { required: true, message: "考试时长不能为空", trigger: "blur" }
        ],
        startTime: [
          { required: true, message: "开始时间不能为空", trigger: "blur" }
        ],
        endTime: [
          { required: true, message: "截止时间不能为空", trigger: "blur" }
        ]
      },
      // 状态映射
      statusOptions: [
        { value: 0, label: "未开始", type: "info" },
        { value: 1, label: "进行中", type: "success" },
        { value: 2, label: "已结束", type: "danger" }
      ]
    };
  },
  created() {
    this.getList();
    this.getTeacherOptions();
    this.getClassOptions();
  },
  methods: {
    /** 查询试卷列表 */
    getList() {
      this.loading = true;
      listPaper(this.queryParams).then(response => {
        this.paperList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    /** 获取教师选项 */
    getTeacherOptions() {
      listTeacherForClass({ pageSize: 100 }).then(response => {
        this.teacherOptions = response.rows.map(item => ({
          userId: item.teacherId,
          nickName: item.teacherName
        }));
      });
    },

    /** 获取课程选项 */
    getClassOptions() {
      listClass({ pageSize: 100 }).then(response => {
        this.classOptions = response.rows;
      });
    },

    /** 根据ID获取教师名称 */
    getTeacherName(teacherId) {
      const teacher = this.teacherOptions.find(item => Number(item.userId) === Number(teacherId));
      return teacher ? teacher.nickName : "未知教师";
    },

    /** 根据ID获取课程名称 */
    getClassName(classId) {
      const classItem = this.classOptions.find(item => Number(item.classId) === Number(classId));
      return classItem ? classItem.className : "未知课程";
    },

    /** 获取状态文本 */
    getStatusText(status) {
      const statusItem = this.statusOptions.find(item => item.value === Number(status));
      return statusItem ? statusItem.label : "未知状态";
    },

    /** 获取状态类型 */
    getStatusType(status) {
      const statusItem = this.statusOptions.find(item => item.value === Number(status));
      return statusItem ? statusItem.type : "info";
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    /** 查看详情操作 */
    handleDetail(row) {
      this.$router.push(`/system/paper/detail/${row.id}`);
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
        title: null,
        teacherId: null,
        classId: null,
        totalScore: 100,
        duration: 120,
        description: null,
        startTime: null,
        endTime: null,
        status: 0,
        aiPrompt: null
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

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加试卷";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getPaper(id).then(response => {
        this.form = response.data;
        // 确保ID类型一致
        if (this.form.teacherId) {
          this.form.teacherId = Number(this.form.teacherId);
        }
        if (this.form.classId) {
          this.form.classId = Number(this.form.classId);
        }
        this.open = true;
        this.title = "修改试卷";
      });
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updatePaper(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPaper(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除试卷编号为"' + ids + '"的数据项？').then(function() {
        return delPaper(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('system/paper/export', {
        ...this.queryParams
      }, `paper_${new Date().getTime()}.xlsx`);
    }
  }
};
</script>


<style scoped>
.app-container {
  padding: 10px;
}

.mb8 {
  margin-bottom: 8px;
}

.user-item {
  display: flex;
  align-items: center;
}

.toolbar-container {
  margin-bottom: 15px;
}
</style>
