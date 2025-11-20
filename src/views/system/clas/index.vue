<template>
  <div class="kz-container">
    <!-- 搜索和过滤区域 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="所属学院" prop="collegeId">
        <el-select
          v-model="queryParams.collegeId"
          filterable
          clearable
          placeholder="请选择学院"
          style="width: 220px"
          @change="handleCollegeChange"
        >
          <el-option
            v-for="item in collegeOptions"
            :key="item.collegeId"
            :label="item.collegeName"
            :value="item.collegeId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属专业" prop="majorId">
        <el-select
          v-model="queryParams.majorId"
          filterable
          placeholder="请先选择学院"
          style="width: 100%"
          :disabled="!queryParams.collegeId"
          @change="handleQuery"
        >
          <el-option
            v-for="item in filteredMajorOptions"
            :key="item.majorId"
            :label="item.majorName"
            :value="item.majorId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="班级名称" prop="clasName">
        <el-input
          v-model="queryParams.clasName"
          placeholder="请输入班级名称"
          prefix-icon="el-icon-search"
          clearable
          @keyup.enter.native="handleQuery"
          class="filter-item"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-card class="toolbar-container" shadow="hover">
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:clas:add']"
          >新增</el-button>
        </el-col>
<!--        <el-col :span="1.5">-->
<!--          <el-button-->
<!--            type="success"-->
<!--            icon="el-icon-edit"-->
<!--            size="mini"-->
<!--            :disabled="single"-->
<!--            @click="handleUpdate"-->
<!--            v-hasPermi="['system:clas:edit']"-->
<!--          >修改</el-button>-->
<!--        </el-col>-->
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:clas:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['system:clas:export']"
          >导出</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
    </el-card>

    <!-- 数据展示区域 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="clasList"
        @selection-change="handleSelectionChange"
        border
        stripe
        highlight-current-row
        row-key="clasId"
        class="responsive-table"
      >
        <el-table-column type="selection" width="50" fixed="left" />
<!--        <el-table-column label="ID" align="center" prop="clasId" width="80" />-->
        <el-table-column type="index" label="序号" width="50" fixed="left" />

        <el-table-column
          label="所属学院"
          align="center"
          prop="collegeName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-tag type="info">{{ scope.row.collegeName || '未分配' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="所属专业"
          align="center"
          prop="majorName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-tag type="success">{{ scope.row.majorName || '未分配' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="班级名称"
          align="center"
          prop="clasName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-tag size="medium">{{ scope.row.clasName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-edit"
              size="mini"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:clas:edit']"
            >修改</el-button>
            <el-button
              type="text"
              icon="el-icon-delete"
              size="mini"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:clas:remove']"
            >删除</el-button>
            <el-button
              type="text"
              icon="el-icon-user"
              size="mini"
              @click="handleViewStudents(scope.row)"
              v-hasPermi="['system:student:list']"
            >学生管理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-container">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- 添加或修改班级对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="班级名称" prop="clasName">
          <el-input v-model="form.clasName" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="所属学院" prop="collegeId">
          <el-select
            v-model="form.collegeId"
            filterable
            placeholder="请选择学院"
            style="width: 100%"
            @change="handleFormCollegeChange"
          >
            <el-option
              v-for="item in collegeOptions"
              :key="item.collegeId"
              :label="item.collegeName"
              :value="item.collegeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业" prop="majorId">
          <el-select
            v-model="form.majorId"
            filterable
            placeholder="请先选择学院"
            style="width: 100%"
            :disabled="!form.collegeId"
          >
            <el-option
              v-for="item in filteredMajorOptions"
              :key="item.majorId"
              :label="item.majorName"
              :value="item.majorId"
            />
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 学生管理对话框 -->
    <el-dialog :title="studentDialogTitle" :visible.sync="studentDialogVisible" width="80%" append-to-body>
      <div class="student-list-container">
        <!-- 学生搜索区域 -->
        <el-form :model="studentQueryParams" ref="studentQueryForm" :inline="true" label-width="68px" size="small">
          <el-form-item label="学号" prop="studentNo">
            <el-input
              v-model="studentQueryParams.studentNo"
              placeholder="请输入学号"
              clearable
              @keyup.enter.native="handleStudentQuery"
            />
          </el-form-item>
          <el-form-item label="姓名" prop="studentName">
            <el-input
              v-model="studentQueryParams.studentName"
              placeholder="请输入姓名"
              clearable
              @keyup.enter.native="handleStudentQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleStudentQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetStudentQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 操作按钮区域 -->
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAddStudent"
              v-hasPermi="['system:student:add']"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              icon="el-icon-upload2"
              size="mini"
              @click="handleImportStudents"
              v-hasPermi="['system:student:import']"
            >导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExportClassStudents"
              v-hasPermi="['system:student:export']"
            >导出</el-button>
          </el-col>
        </el-row>



        <!-- 学生表格 -->
        <el-table v-loading="studentLoading" :data="studentList" @selection-change="handleStudentSelectionChange" border>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="学号" align="center" prop="studentNo" />
          <el-table-column label="姓名" align="center" prop="studentName" />
          <el-table-column label="性别" align="center" prop="studentSex" width="60">
            <template slot-scope="scope">
              <el-tag :type="scope.row.studentSex === '男' ? 'primary' : 'success'">{{ scope.row.studentSex }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="180">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                circle
                @click="handleEditStudent(scope.row)"
                v-hasPermi="['system:student:edit']"
                title="编辑"
              ></el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                circle
                @click="handleDeleteStudent(scope.row)"
                v-hasPermi="['system:student:remove']"
                title="删除"
              ></el-button>
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-key"
                circle
                @click="handleResetStudentPassword(scope.row)"
                v-hasPermi="['system:student:edit']"
                title="重置密码"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 学生分页 -->
        <pagination
          v-show="studentTotal > 0"
          :total="studentTotal"
          :page.sync="studentQueryParams.pageNum"
          :limit.sync="studentQueryParams.pageSize"
          @pagination="getStudentList"
        />
      </div>
    </el-dialog>

    <!-- 添加或修改学生对话框 -->
    <el-dialog :title="studentFormTitle" :visible.sync="studentFormOpen" width="600px" append-to-body>
      <el-form ref="studentForm" :model="studentForm" :rules="studentRules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="学号" prop="studentNo">
              <el-input v-model="studentForm.studentNo" placeholder="请输入学号" prefix-icon="el-icon-user" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="studentName">
              <el-input v-model="studentForm.studentName" placeholder="请输入姓名" prefix-icon="el-icon-s-custom" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="密码" prop="studentPassword">
              <el-input
                v-model="studentForm.studentPassword"
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="studentSex">
              <el-radio-group v-model="studentForm.studentSex">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitStudentForm" :loading="studentSubmitLoading">确 定</el-button>
        <el-button @click="cancelStudent">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 导入学生对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="500px" append-to-body>
      <el-steps :active="upload.step" finish-status="success" simple style="margin-bottom: 20px">
        <el-step title="选择文件"></el-step>
        <el-step title="上传数据"></el-step>
        <el-step title="导入完成"></el-step>
      </el-steps>

      <div v-if="upload.step === 0">
        <el-form :model="upload.options" label-width="120px" style="margin-bottom: 15px;">
          <el-form-item label="默认昵称设置">
            <el-radio-group v-model="upload.options.nicknameType">
              <el-radio label="same">与姓名相同</el-radio>
              <el-radio label="prefix">姓名+前缀</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="前缀" v-if="upload.options.nicknameType === 'prefix'">
            <el-input v-model="upload.options.nicknamePrefix" placeholder="请输入前缀，如'学生'"></el-input>
          </el-form-item>
        </el-form>
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
import { listClas, getClas, delClas, addClas, updateClas } from "@/api/system/clas";
import { listMajor } from "@/api/system/major";
import { listCollege } from "@/api/system/college";
import { listStudent, getStudent, delStudent, addStudent, updateStudent, resetStudentPassword, importStudentData } from "@/api/system/student";
import { resetStudentPwd } from '@/api/system/user'
import { getToken } from "@/utils/auth";

export default {
  name: "Clas",
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
      // 班级表格数据
      clasList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        clasName: null,
        collegeId: null,
        majorId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        clasName: [
          { required: true, message: "班级名称不能为空", trigger: "blur" }
        ],
        majorId: [
          { required: true, message: "所属专业不能为空", trigger: "change" }
        ]
      },
      // 学院和专业选项
      collegeOptions: [],
      majorOptions: [],
      filteredMajorOptions: [],
      // 学生相关数据
      studentDialogVisible: false,
      studentDialogTitle: "",
      studentList: [],
      studentTotal: 0,
      studentLoading: false,
      studentIds: [],
      studentSingle: true,
      studentMultiple: true,
      selectedClass: null,
      studentQueryParams: {
        pageNum: 1,
        pageSize: 10,
        studentNo: null,
        studentName: null,
        clasId: null
      },
      // 学生表单
      studentFormOpen: false,
      studentFormTitle: "",
      studentForm: {},
      studentSubmitLoading: false,
      studentRules: {
        studentNo: [
          { required: true, message: "学号不能为空", trigger: "blur" },
          { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" }
        ],
        studentName: [
          { required: true, message: "姓名不能为空", trigger: "blur" }
        ],
        studentPassword: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
        ],
        studentSex: [
          { required: true, message: "请选择性别", trigger: "change" }
        ]
      },
      // 上传参数
      upload: {
        open: false,
        title: "导入学生数据",
        isUploading: false,
        headers: { Authorization: "Bearer " + getToken() },
        step: 0,
        percentage: 0,
        statusText: "正在上传...",
        fileSelected: false,
        successCount: 0,
        options: {
          nicknameType: "same",
          nicknamePrefix: "学生"
        }
      }
    };
  },
  created() {
    // 首先加载学院和专业数据
    Promise.all([
      this.getCollegeOptions(),
      this.getMajorOptions()
    ]).then(() => {
      // 然后再加载班级列表
      this.getList();
    });
  },
  methods: {
    /** 获取学院选项 */
    getCollegeOptions() {
      return listCollege({ pageSize: 100 }).then(response => {
        this.collegeOptions = response.rows;
      });
    },
    /** 获取专业选项 */
    getMajorOptions() {
      return listMajor({ pageSize: 100 }).then(response => {
        this.majorOptions = response.rows;
        this.filterMajors();
      });
    },
    /** 根据学院过滤专业 */
    filterMajors() {
      if (this.queryParams.collegeId) {
        this.filteredMajorOptions = this.majorOptions.filter(
          major => major.collegeId === this.queryParams.collegeId
        );
      } else {
        this.filteredMajorOptions = this.majorOptions;
      }
      if (this.queryParams.majorId && !this.filteredMajorOptions.some(m => m.majorId === this.queryParams.majorId)) {
        this.queryParams.majorId = null;
      }
    },
    /** 学院选择变化 */
    handleCollegeChange() {
      this.filterMajors();
      this.handleQuery();
    },
    /** 表单中的学院选择变化 */
    handleFormCollegeChange() {
      if (this.form.collegeId) {
        this.filteredMajorOptions = this.majorOptions.filter(
          major => major.collegeId === this.form.collegeId
        );
      } else {
        this.filteredMajorOptions = this.majorOptions;
      }
      this.form.majorId = null;
    },
    /** 查询班级列表 */
    getList() {
      this.loading = true;
      listClas(this.queryParams).then(response => {
        this.clasList = response.rows.map(clas => {
          const major = this.majorOptions.find(m => m.majorId === clas.majorId);
          const college = this.collegeOptions.find(c => c.collegeId === (major ? major.collegeId : null));
          return {
            ...clas,
            majorName: major ? major.majorName : '未分配',
            collegeName: college ? college.collegeName : '未分配'
          };
        });
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.clasName = null;
      this.queryParams.collegeId = null;
      this.queryParams.majorId = null;
      this.filterMajors();
      this.handleQuery();
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.clasId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加班级";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const clasId = row.clasId || this.ids;
      getClas(clasId).then(response => {
        this.form = response.data;
        this.handleFormCollegeChange();
        this.open = true;
        this.title = "修改班级";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.clasId != null) {
            updateClas(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addClas(this.form).then(response => {
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
      const clasIds = row.clasId || this.ids;
      this.$modal.confirm('是否确认删除班级编号为"' + clasIds + '"的数据项？').then(() => {
        return delClas(clasIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/clas/export', {
        ...this.queryParams
      }, `clas_${new Date().getTime()}.xlsx`);
    },
    /** 查看学生按钮操作 */
    handleViewStudents(row) {
      this.selectedClass = row;
      this.studentDialogTitle = `${row.clasName} - 学生列表`;
      this.studentDialogVisible = true;
      this.studentQueryParams.clasId = row.clasId;
      this.getStudentList();
    },
    /** 查询学生列表 */
    getStudentList() {
      this.studentLoading = true;
      listStudent(this.studentQueryParams).then(response => {
        this.studentList = response.rows;
        this.studentTotal = response.total;
        this.studentLoading = false;
      });
    },
    /** 学生搜索按钮操作 */
    handleStudentQuery() {
      this.studentQueryParams.pageNum = 1;
      this.getStudentList();
    },
    /** 重置学生搜索 */
    resetStudentQuery() {
      this.resetForm("studentQueryForm");
      this.studentQueryParams.studentNo = null;
      this.studentQueryParams.studentName = null;
      this.studentQueryParams.clasId = this.selectedClass.clasId;
      this.handleStudentQuery();
    },
    /** 学生多选框选中数据 */
    handleStudentSelectionChange(selection) {
      this.studentIds = selection.map(item => item.studentId);
      this.studentSingle = selection.length !== 1;
      this.studentMultiple = !selection.length;
    },
    /** 新增学生按钮操作 */
    handleAddStudent() {
      this.resetStudentForm();
      this.studentFormOpen = true;
      this.studentFormTitle = "添加学生";
    },
    /** 编辑学生按钮操作 */
    handleEditStudent(row) {
      this.resetStudentForm();
      this.studentFormOpen = true;
      this.studentFormTitle = "修改学生";
      this.studentSubmitLoading = true;
      const studentNo = row.studentNo;
      getStudent(studentNo).then(response => {
        this.studentForm = response.data;
        this.studentSubmitLoading = false;
      }).catch(() => {
        this.studentSubmitLoading = false;
      });
    },
    /** 重置学生表单 */
    resetStudentForm() {
      this.studentForm = {
        studentId: null,
        studentNo: "",
        studentName: "",
        studentPassword: "",
        studentSex: '男',
        clasId: this.selectedClass ? this.selectedClass.clasId : null,
        className: this.selectedClass ? this.selectedClass.clasName : ""
      };
      this.resetForm("studentForm");
    },
    /** 取消学生表单 */
    cancelStudent() {
      this.studentFormOpen = false;
      this.resetStudentForm();
    },
    /** 提交学生表单 */
    submitStudentForm() {
      this.$refs["studentForm"].validate(valid => {
        if (valid) {
          this.studentSubmitLoading = true;
          if (this.studentForm.studentId != null) {
            updateStudent(this.studentForm).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.studentFormOpen = false;
              this.getStudentList();
              this.studentSubmitLoading = false;
            }).catch(() => {
              this.studentSubmitLoading = false;
            });
          } else {
            addStudent(this.studentForm).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.studentFormOpen = false;
              this.getStudentList();
              this.studentSubmitLoading = false;
            }).catch(() => {
              this.studentSubmitLoading = false;
            });
          }
        }
      });
    },
    /** 删除学生按钮操作 */
    handleDeleteStudent(row) {
      const studentIds = row.studentId || this.studentIds;
      this.$modal.confirm('是否确认删除学生编号为"' + studentIds + '"的数据项？').then(() => {
        return delStudent(studentIds);
      }).then(() => {
        this.getStudentList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 重置学生密码 */
    handleResetStudentPassword(row) {
      this.$prompt('请输入新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPattern: /^.{6,20}$/,
        inputErrorMessage: '密码长度必须介于 6 和 20 之间'
      }).then(({ value }) => {
        resetStudentPwd(row.studentId, value).then(response => {
          this.$modal.msgSuccess("密码重置成功，新密码为：" + value);
        });
      }).catch(() => {});
    },
    /** 导出班级学生 */
    handleExportClassStudents() {
      this.download('system/student/export', {
        clasId: this.selectedClass.clasId
      }, `${this.selectedClass.clasName}_学生_${new Date().getTime()}.xlsx`);
    },
    /** 处理导入学生按钮 */
    handleImportStudents() {
      this.upload.open = true;
      this.upload.step = 0;
      this.upload.percentage = 0;
      this.upload.fileSelected = false;
      this.upload.title = `导入学生到 ${this.selectedClass.clasName}`;
    },
    /** 下载导入模板 */
    importTemplate() {
      this.download('system/student/importTemplate', {}, `student_template_${new Date().getTime()}.xlsx`);
    },
    /** 处理文件选择变更 */
    handleFileChange(file) {
      this.upload.fileSelected = true;
    },
    /** 处理文件移除 */
    handleFileRemove() {
      this.upload.fileSelected = false;
    },
    /** 自定义文件上传处理 */
    handleFileUpload(options) {
      const formData = new FormData();
      formData.append('file', options.file);
      formData.append('clasId', this.selectedClass.clasId);
      formData.append('className', this.selectedClass.clasName);
      formData.append('nicknameType', this.upload.options.nicknameType);
      if (this.upload.options.nicknameType === 'prefix') {
        formData.append('nicknamePrefix', this.upload.options.nicknamePrefix);
      }

      this.upload.isUploading = true;
      this.upload.step = 1;
      this.upload.percentage = 0;
      this.upload.statusText = "正在上传...";

      // 模拟进度
      this.upload.percentage = 30;
      setTimeout(() => {
        this.upload.percentage = 60;
      }, 500);
      setTimeout(() => {
        this.upload.percentage = 80;
      }, 1000);
      setTimeout(() => {
        this.upload.statusText = "正在处理数据...";
      }, 1500);

      importStudentData(formData).then(response => {
        this.upload.percentage = 100;
        this.upload.statusText = "导入完成";

        setTimeout(() => {
          this.upload.isUploading = false;
          this.upload.step = 2;
          let countMatch = response.msg.match(/成功导入(\d+)条数据/);
          this.upload.successCount = countMatch ? parseInt(countMatch[1]) : 0;
          this.$refs.upload.clearFiles();
          this.getStudentList();
        }, 500);
      }).catch(error => {
        this.upload.isUploading = false;
        this.upload.step = 0;
        this.$modal.msgError("导入失败：" + (error.message || "未知错误"));
      });
    },
    /** 提交上传文件 */
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
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置 */
    reset() {
      this.form = {
        clasId: null,
        clasName: null,
        collegeId: null,
        majorId: null
      };
      this.filteredMajorOptions = this.majorOptions;
      this.resetForm("form");
    }
  }
};
</script>

<style scoped>
.kz-container {
  padding: 20px;
  min-height: calc(100vh - 100px);
}

.filter-item {
  max-width: 220px;
  margin-right: 10px;
}

.table-container {
  margin-bottom: 20px;
}

.responsive-table {
  width: 100%;
  overflow-x: auto;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media screen and (max-width: 768px) {
  .filter-item {
    max-width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
}

.toolbar-container {
  margin-bottom: 15px;
}

.student-list-container {
  padding: 10px 0;
}

.text-center {
  text-align: center;
}
</style>
