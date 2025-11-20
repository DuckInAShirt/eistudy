<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="filter-container" shadow="hover">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
        <el-form-item label="教师工号" prop="teacherNo">
          <el-input
            v-model="queryParams.teacherNo"
            placeholder="请输入教师工号"
            clearable
            prefix-icon="el-icon-user"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="教师姓名" prop="teacherName">
          <el-input
            v-model="queryParams.teacherName"
            placeholder="请输入教师姓名"
            clearable
            prefix-icon="el-icon-s-custom"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="所属学院" prop="collegeId">
          <el-select v-model="queryParams.collegeId" placeholder="请选择学院" clearable style="width: 220px">
            <el-option
              v-for="item in collegeOptions"
              :key="item.collegeId"
              :label="item.collegeName"
              :value="item.collegeId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工具栏区域 -->
    <el-card class="toolbar-container" shadow="hover">
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:teacher:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:teacher:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['system:teacher:export']"
          >导出</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
    </el-card>

    <!-- 教师卡片展示 -->
    <div v-loading="loading" class="teacher-tiles-container">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in teacherList" :key="item.teacherId">
          <el-card shadow="hover" :body-style="{ padding: '0px' }" class="teacher-card">
            <div class="teacher-card-header" :class="'bg-color-' + (item.teacherId % 5)">
              <el-checkbox
                v-model="item.isSelected"
                @change="(val) => handleSelectChange(val, item)"
              ></el-checkbox>
              <span class="teacher-status">
                <el-tag :type="item.delFlag === '0' ? 'success' : 'danger'" size="mini">
                  {{ item.delFlag === '0' ? '在职' : '离职' }}
                </el-tag>
              </span>
            </div>
            <div class="teacher-card-body">
              <div class="teacher-avatar">
                <el-avatar :size="70" icon="el-icon-user-solid">
                  {{ item.teacherName ? item.teacherName.substr(0, 1) : 'T' }}
                </el-avatar>
              </div>
              <h3 class="teacher-name" :title="item.teacherName">{{ item.teacherName }}</h3>
              <div class="teacher-info">
                <div class="info-item">
                  <i class="el-icon-postcard"></i>
                  <span>工号: {{ item.teacherNo }}</span>
                </div>
                <div class="info-item">
                  <i class="el-icon-school"></i>
                  <span>学院: {{ getCollegeName(item.collegeId) }}</span>
                </div>
                <div class="info-item">
                  <i class="el-icon-date"></i>
                  <span>创建时间: {{ item.createTime }}</span>
                </div>
              </div>
            </div>
            <div class="teacher-card-actions">
              <el-button
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(item)"
                v-hasPermi="['system:teacher:edit']"
              >修改</el-button>
              <el-button
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(item)"
                v-hasPermi="['system:teacher:remove']"
              >删除</el-button>
              <el-button
                type="text"
                icon="el-icon-key"
                @click="handleResetPassword(item)"
                v-hasPermi="['system:teacher:edit']"
              >重置密码</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改教师对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="教师工号" prop="teacherNo">
              <el-input
                v-model="form.teacherNo"
                placeholder="请输入教师工号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教师姓名" prop="teacherName">
              <el-input v-model="form.teacherName" placeholder="请输入教师姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="所属学院" prop="collegeId">
              <el-select v-model="form.collegeId" placeholder="请选择学院" style="width: 100%">
                <el-option
                  v-for="item in collegeOptions"
                  :key="item.collegeId"
                  :label="item.collegeName"
                  :value="item.collegeId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="teacherPassword" v-if="form.teacherId === null">
              <el-input
                v-model="form.teacherPassword"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="状态" prop="delFlag" v-if="form.teacherId !== null">
          <el-radio-group v-model="form.delFlag">
            <el-radio label="0">在职</el-radio>
            <el-radio label="1">离职</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider content-position="center">账号同步信息</el-divider>

        <el-alert
          title="系统将自动为教师创建用户账号并分配教师角色。"
          type="info"
          show-icon
          :closable="false"
          style="margin-bottom: 20px"
        ></el-alert>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTeacher, getTeacher, delTeacher, addTeacher, updateTeacher, resetTeacherPassword } from "@/api/system/teacher";
import { listCollege } from "@/api/system/college";
import { resetTeacherPwd, resetUserPwd } from '@/api/system/user'

export default {
  name: "Teacher",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 提交按钮loading
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
      // 教师表格数据
      teacherList: [],
      // 学院选项
      collegeOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 12,
        teacherNo: null,
        teacherName: null,
        collegeId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        teacherNo: [
          { required: true, message: "教师工号不能为空", trigger: "blur" },
          { pattern: /^\d+$/, message: "教师工号必须为数字", trigger: "blur" }
        ],
        teacherName: [
          { required: true, message: "教师姓名不能为空", trigger: "blur" }
        ],
        collegeId: [
          { required: true, message: "所属学院不能为空", trigger: "change" }
        ],
        teacherPassword: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度必须在6到20个字符之间", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getCollegeOptions();
  },
  methods: {
    /** 查询教师列表 */
    getList() {
      this.loading = true;
      listTeacher(this.queryParams).then(response => {
        this.teacherList = response.rows.map(item => {
          return {
            ...item,
            isSelected: false
          };
        });
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 获取学院选项 */
    getCollegeOptions() {
      listCollege({ pageSize: 100 }).then(response => {
        this.collegeOptions = response.rows;
      });
    },
    /** 根据ID获取学院名称 */
    getCollegeName(collegeId) {
      const college = this.collegeOptions.find(item => item.collegeId === collegeId);
      return college ? college.collegeName : collegeId;
    },
    /** 处理选择变更 */
    handleSelectChange(val, item) {
      if (val) {
        this.ids.push(item.teacherId);
      } else {
        this.ids = this.ids.filter(id => id !== item.teacherId);
      }
      this.single = this.ids.length !== 1;
      this.multiple = this.ids.length === 0;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        teacherId: null,
        teacherNo: null,
        teacherName: null,
        teacherPassword: null,
        collegeId: null,
        delFlag: "0"
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
      this.title = "添加教师";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const teacherId = row.teacherId || this.ids[0];
      getTeacher(teacherId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改教师";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.form.teacherId != null) {
            updateTeacher(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.submitLoading = false;
            }).catch(() => {
              this.submitLoading = false;
            });
          } else {
            addTeacher(this.form).then(response => {
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
      const teacherIds = row.teacherId || this.ids.join(',');
      this.$modal.confirm('是否确认删除教师编号为"' + teacherIds + '"的数据项？').then(function() {
        return delTeacher(teacherIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/teacher/export', {
        ...this.queryParams
      }, `teacher_${new Date().getTime()}.xlsx`)
    },
    /** 重置密码操作 */
    handleResetPassword(row) {
      this.$prompt('请输入新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPattern: /^.{6,20}$/,
        inputErrorMessage: '密码长度必须介于 6 和 20 之间'
      }).then(({ value }) => {
        resetTeacherPwd(row.teacherId, value).then(response => {
          this.$modal.msgSuccess("密码重置成功，新密码为：" + value);
        });
      }).catch(() => {});
    },
  }
};
</script>

<style scoped>
.app-container {
  padding: 10px;
}

.filter-container, .toolbar-container {
  margin-bottom: 15px;
}
.filter-container{
  height: 70px;
}

.teacher-tiles-container {
  margin-bottom: 20px;
}

.teacher-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 8px;
  overflow: hidden;
}

.teacher-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.teacher-card-header {
  height: 60px;
  padding: 15px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bg-color-0 { background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); }
.bg-color-1 { background: linear-gradient(135deg, #03A9F4 0%, #0288D1 100%); }
.bg-color-2 { background: linear-gradient(135deg, #673AB7 0%, #512DA8 100%); }
.bg-color-3 { background: linear-gradient(135deg, #FF5722 0%, #E64A19 100%); }
.bg-color-4 { background: linear-gradient(135deg, #009688 0%, #00796B 100%); }

.teacher-card-body {
  padding: 20px 15px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.teacher-avatar {
  margin-bottom: 15px;
}

.teacher-name {
  margin: 0 0 15px 0;
  font-size: 18px;
  text-align: center;
}

.teacher-info {
  width: 100%;
  color: #666;
  font-size: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item i {
  width: 20px;
  margin-right: 8px;
  color: #409EFF;
}

.teacher-card-actions {
  display: flex;
  justify-content: space-around;
  padding: 10px 15px;
  border-top: 1px solid #eee;
}

.teacher-status {
  position: relative;
  top: -8px;
}
</style>
