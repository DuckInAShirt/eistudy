<template>
  <div class="app-container">
    <!-- 卡片式布局 -->
    <el-card class="box-card" shadow="hover">
      <!-- 搜索区域 -->
      <div class="filter-container">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px" size="small">
          <el-form-item label="学生工号" prop="studentNo">
            <el-input
              v-model="queryParams.studentNo"
              placeholder="请输入学生工号"
              clearable
              @keyup.enter.native="handleQuery"
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          <el-form-item label="学生姓名" prop="studentName">
            <el-input
              v-model="queryParams.studentName"
              placeholder="请输入学生姓名"
              clearable
              @keyup.enter.native="handleQuery"
              prefix-icon="el-icon-s-custom"
            />
          </el-form-item>
          <el-form-item label="班级" prop="className">
            <el-input
              v-model="queryParams.className"
              placeholder="请输入班级"
              clearable
              @keyup.enter.native="handleQuery"
              prefix-icon="el-icon-school"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮区域 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:student:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            icon="el-icon-edit"
            size="mini"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:student:edit']"
          >修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:student:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-dropdown @command="handleCommand" split-button type="info" size="mini">
            <span>数据操作</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="import" icon="el-icon-upload2">导入数据</el-dropdown-item>
              <el-dropdown-item command="export" icon="el-icon-download">导出数据</el-dropdown-item>
              <el-dropdown-item command="template" icon="el-icon-document">下载模板</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="studentList"
        @selection-change="handleSelectionChange"
        border
        stripe
        highlight-current-row
        style="width: 100%; margin-top: 10px;"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="学生ID" align="center" prop="studentId" width="80" />
        <el-table-column label="学生工号" align="center" prop="studentNo" width="120" />
        <el-table-column label="学生姓名" align="center" prop="studentName" min-width="100" :show-overflow-tooltip="true" />
        <el-table-column label="性别" align="center" prop="studentSex" width="60">
          <template slot-scope="scope">
            <el-tag :type="scope.row.studentSex === '男' ? 'primary' : 'success'">{{ scope.row.studentSex }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="班级id" align="center" prop="clasId" width="60" />
        <el-table-column label="班级" align="center" prop="className" min-width="120" :show-overflow-tooltip="true" />
        <el-table-column label="密码" align="center" prop="studentPassword" min-width="120">
          <template slot-scope="scope">
            <el-tag type="info">******</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              circle
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:student:edit']"
              title="修改"
            ></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              circle
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:student:remove']"
              title="删除"
            ></el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-key"
              circle
              @click="handleResetPassword(scope.row)"
              v-hasPermi="['system:student:edit']"
              title="重置密码"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加或修改学生信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="学生工号" prop="studentNo">
              <el-input v-model="form.studentNo" placeholder="请输入学生工号" prefix-icon="el-icon-user" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学生姓名" prop="studentName">
              <el-input v-model="form.studentName" placeholder="请输入学生姓名" prefix-icon="el-icon-s-custom" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="密码" prop="studentPassword">
              <el-input
                v-model="form.studentPassword"
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="studentSex">
              <el-radio-group v-model="form.studentSex">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="班级" prop="className">
          <el-input v-model="form.className" placeholder="请输入班级" prefix-icon="el-icon-school" />
        </el-form-item>

        <el-form-item label="状态" prop="delFlag" v-if="form.studentId">
          <el-radio-group v-model="form.delFlag">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="500px" append-to-body>
      <el-steps :active="upload.step" finish-status="success" simple style="margin-bottom: 20px">
        <el-step title="选择文件"></el-step>
        <el-step title="上传数据"></el-step>
        <el-step title="导入完成"></el-step>
      </el-steps>

      <div v-if="upload.step === 0">
        <el-upload
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          action="#"
          :disabled="upload.isUploading"
          :http-request="handleFileUpload"
          :auto-upload="false"
          drag
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将Excel文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip text-center" slot="tip">
            <span>仅允许导入xls、xlsx格式文件，文件大小不能超过5MB</span>
            <div style="margin-top: 10px;">
              <el-link
                type="primary"
                :underline="false"
                style="font-size:12px;vertical-align: baseline;"
                @click="importTemplate"
              >下载导入模板</el-link>
            </div>
          </div>
        </el-upload>
      </div>

      <div v-if="upload.step === 1" style="text-align: center; padding: 20px 0;">
        <el-progress
          :percentage="upload.percentage"
          :status="upload.percentage === 100 ? 'success' : ''"
          :stroke-width="18"
        ></el-progress>
        <div style="margin-top: 15px; color: #606266;">
          <i class="el-icon-loading" v-if="upload.percentage < 100"></i>
          <i class="el-icon-circle-check" v-else style="color: #67C23A;"></i>
          <span style="margin-left: 5px;">{{ upload.statusText }}</span>
        </div>
      </div>

      <div v-if="upload.step === 2" style="text-align: center; padding: 20px 0;">
        <i class="el-icon-circle-check" style="font-size: 50px; color: #67C23A;"></i>
        <h3 style="margin: 15px 0;">导入成功</h3>
        <p>成功导入 {{ upload.successCount }} 条数据</p>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="upload.open = false" v-if="upload.step === 2">关 闭</el-button>
        <el-button @click="upload.step = 0" v-if="upload.step === 2">继续导入</el-button>
        <el-button type="primary" @click="submitFileForm" v-if="upload.step === 0" :disabled="!upload.fileSelected">开始导入</el-button>
        <el-button @click="upload.open = false" v-if="upload.step === 0">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listStudent, getStudent, delStudent, addStudent, updateStudent, importStudentData, resetStudentPassword } from "@/api/system/student";
import { getToken } from "@/utils/auth";

export default {
  name: "Student",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 提交加载
      submitLoading: false,
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
      // 学生信息表格数据
      studentList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        studentNo: null,
        studentName: null,
        studentPassword: null,
        studentSex: null,
        className: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        studentNo: [
          { required: true, message: "学生工号不能为空", trigger: "blur" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" }
        ],
        studentName: [
          { required: true, message: "学生姓名不能为空", trigger: "blur" }
        ],
        studentPassword: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
        ],
        studentSex: [
          { required: true, message: "请选择性别", trigger: "change" }
        ],
        className: [
          { required: true, message: "班级不能为空", trigger: "blur" }
        ]
      },
      // 上传参数
      upload: {
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: "导入学生数据",
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 当前步骤
        step: 0,
        // 上传进度
        percentage: 0,
        // 状态文本
        statusText: "正在上传...",
        // 是否已选择文件
        fileSelected: false,
        // 成功导入数量
        successCount: 0
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 处理文件选择变更
    handleFileChange(file) {
      this.upload.fileSelected = true;
    },

    // 处理文件移除
    handleFileRemove() {
      this.upload.fileSelected = false;
    },

    // 处理下拉菜单命令
    handleCommand(command) {
      if (command === 'import') {
        this.handleImport();
      } else if (command === 'export') {
        this.handleExport();
      } else if (command === 'template') {
        this.importTemplate();
      }
    },

    // 处理导入按钮点击
    handleImport() {
      this.upload.open = true;
      this.upload.step = 0;
      this.upload.percentage = 0;
      this.upload.fileSelected = false;
    },

    // 下载模板操作
    importTemplate() {
      this.download('system/student/importTemplate', {}, `student_template_${new Date().getTime()}.xlsx`);
    },

    // 自定义文件上传处理
    handleFileUpload(options) {
      const formData = new FormData();
      formData.append('file', options.file);

      this.upload.isUploading = true;
      this.upload.step = 1;
      this.upload.percentage = 0;
      this.upload.statusText = "正在上传...";

      // 快速模拟进度
      this.upload.percentage = 30;
      setTimeout(() => { this.upload.percentage = 60; }, 500);
      setTimeout(() => { this.upload.percentage = 80; }, 1000);
      setTimeout(() => { this.upload.statusText = "正在处理数据..."; }, 1500);

      importStudentData(formData).then(response => {
        this.upload.percentage = 100;
        this.upload.statusText = "导入完成";

        setTimeout(() => {
          this.upload.isUploading = false;
          this.upload.step = 2;
          this.upload.successCount = response.data || 0;
          this.$refs.upload.clearFiles();
          this.getList();
        }, 500);
      }).catch(error => {
        this.upload.isUploading = false;
        this.upload.step = 0;
        this.$modal.msgError("导入失败：" + (error.message || "未知错误"));
        console.error(error);
      });
    },

    // 提交上传文件
    submitFileForm() {
      if (!this.$refs.upload.uploadFiles || this.$refs.upload.uploadFiles.length === 0) {
        this.$modal.msgError("请先选择要导入的文件");
        return;
      }

      const fileObj = this.$refs.upload.uploadFiles[0];
      this.handleFileUpload({
        file: fileObj.raw || fileObj
      });
    },

    // 重置密码
    handleResetPassword(row) {
      this.$modal.confirm('确定要重置该学生的密码吗？').then(() => {
        resetStudentPassword(row.studentId).then(response => {
          this.$modal.msgSuccess("密码重置成功");
        });
      }).catch(() => {});
    },

    /** 查询学生信息列表 */
    getList() {
      this.loading = true;
      listStudent(this.queryParams).then(response => {
        this.studentList = response.rows;
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
        studentId: null,
        studentNo: null,
        studentName: null,
        studentPassword: null,
        studentSex: '男',
        className: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: '0'
      };
      this.resetForm("form");
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum =  1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.studentId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加学生信息";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const studentId = row.studentId || this.ids
      getStudent(studentId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改学生信息";
      });
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.form.studentId != null) {
            updateStudent(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.submitLoading = false;
            }).catch(() => {
              this.submitLoading = false;
            });
          } else {
            addStudent(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              this.submitLoading = false;
            }).catch(() => {
              this.submitLoading = false;
            });
          }
        }
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const studentIds = row.studentId || this.ids;
      this.$modal.confirm('是否确认删除学生信息编号为"' + studentIds + '"的数据项？').then(() => {
        return delStudent(studentIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('system/student/export', {
        ...this.queryParams
      }, `student_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped>
.filter-container {
  padding-bottom: 15px;
}
.box-card {
  margin-bottom: 15px;
}
.text-center {
  text-align: center;
}
.mb8 {
  margin-bottom: 15px;
}
</style>
