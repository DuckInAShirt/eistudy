<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学院名称" prop="collegeName">
        <el-input
          v-model="queryParams.collegeName"
          placeholder="请输入学院名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系统名称" prop="systemName">
        <el-input
          v-model="queryParams.systemName"
          placeholder="请输入系统名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
<!--      <el-form-item label="学院头像" prop="collegeAvatar">-->
<!--        <el-input-->
<!--          v-model="queryParams.collegeAvatar"-->
<!--          placeholder="请输入学院头像"-->
<!--          clearable-->
<!--          @keyup.enter.native="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-card class="toolbar-container" shadow="hover" v-hasPermi="['system:college:add']">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:college:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:college:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['system:college:export']"
          >导出</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
    </el-card>



    <el-table v-loading="loading" :data="collegeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="学院id" align="center" prop="collegeId" />-->
      <el-table-column label="学院名称" align="center" prop="collegeName" />
      <el-table-column label="系统名称" align="center" prop="systemName" />
<!--      <el-table-column label="学院头像" align="center" prop="collegeAvatar" width="100px">-->
<!--        <template slot-scope="scope">-->
<!--          <image-preview :src="scope.row.collegeAvatar" />-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:college:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:college:remove']"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-user"
            @click="handleManageAdmins(scope.row)"
            v-hasPermi="['system:college:add']"
          >管理员</el-button>
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

    <!-- 添加或修改学院对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学院名称" prop="collegeName">
          <el-input v-model="form.collegeName" placeholder="请输入学院名称" />
        </el-form-item>
        <el-form-item label="系统名称" prop="systemName">
          <el-input v-model="form.systemName" placeholder="请输入系统名称" />
        </el-form-item>
<!--        <el-form-item label="学院头像" prop="collegeAvatar">-->
<!--          <el-upload-->
<!--            class="avatar-uploader"-->
<!--            action="/dev-api/common/upload"-->
<!--            :headers="headers"-->
<!--            :show-file-list="false"-->
<!--            :on-success="handleAvatarSuccess"-->
<!--            :before-upload="beforeAvatarUpload">-->
<!--            <img v-if="form.collegeAvatar" :src="form.collegeAvatar" class="avatar">-->
<!--            <i v-else class="el-icon-plus avatar-uploader-icon"></i>-->
<!--          </el-upload>-->
<!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 学院管理员管理对话框 -->
    <el-dialog :title="currentCollege.collegeName + ' - 管理员管理'" :visible.sync="adminOpen" width="800px" append-to-body>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAddAdmin"
          >新增管理员</el-button>
        </el-col>
      </el-row>

      <!-- 管理员列表 -->
      <el-table v-loading="adminLoading" :data="adminList">
        <el-table-column label="用户ID" align="center" prop="userId" />
        <el-table-column label="用户名" align="center" prop="userName" />
        <el-table-column label="姓名" align="center" prop="nickName" />
        <el-table-column label="手机号" align="center" prop="phonenumber" />
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDeleteAdmin(scope.row)"
            >删除</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-key"
              @click="handleResetPwd(scope.row)"
            >重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="adminTotal>0"
        :total="adminTotal"
        :page.sync="adminQueryParams.pageNum"
        :limit.sync="adminQueryParams.pageSize"
        @pagination="getAdminList"
      />
    </el-dialog>

    <!-- 添加管理员对话框 -->
    <el-dialog :title="'添加 ' + currentCollege.collegeName + ' 管理员'" :visible.sync="adminAddOpen" width="500px" append-to-body>
      <el-form ref="adminForm" :model="adminForm" :rules="adminRules" label-width="80px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="adminForm.userName" placeholder="请输入登录用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="nickName">
          <el-input v-model="adminForm.nickName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phonenumber">
          <el-input v-model="adminForm.phonenumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="adminForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAdminForm">确 定</el-button>
        <el-button @click="cancelAdmin">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listCollege, getCollege, delCollege, addCollege, updateCollege } from "@/api/system/college";
// 导入用户相关API
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  resetUserPwd,
  changeUserStatus,
  listUserAdmin
} from '@/api/system/user'

import { getToken } from "@/utils/auth";
export default {
  name: "College",
  data() {
    return {
      // 学院管理员相关数据
      adminOpen: false,
      adminAddOpen: false,
      adminLoading: false,
      adminTotal: 0,
      adminList: [],
      currentCollege: {},
      adminQueryParams: {
        pageNum: 1,
        pageSize: 10,
        collegeId: null,
      },
      adminForm: {
        userName: '',
        nickName: '',
        phonenumber: '',
        email: '',
        password: '',
        collegeId: null,
        roleIds: [101], // 学院管理员角色ID
        status: "0"
      },

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
      // 学院表格数据
      collegeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        collegeName: null,
        systemName: null,
        collegeAvatar: null
      },
      // 表单参数
      form: {},
      headers: {
        Authorization: 'Bearer ' + getToken()
      },
      // 表单校验
      rules: {
        collegeName: [
          { required: true, message: "学院名称不能为空", trigger: "blur" }
        ]
      },
      adminRules: {
        userName: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
          { min: 2, max: 20, message: "用户名长度必须介于 2 和 20 之间", trigger: "blur" }
        ],
        nickName: [
          { required: true, message: "姓名不能为空", trigger: "blur" }
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度必须介于 6 和 20 之间", trigger: "blur" }
        ],
        email: [
          { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }
        ],
        phonenumber: [
          { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 管理员管理按钮操作 */
    handleManageAdmins(row) {
      this.currentCollege = row;
      this.adminQueryParams.collegeId = row.collegeId;
      this.adminOpen = true;
      this.getAdminList();
    },

    /** 获取学院管理员列表 */
    getAdminList() {
      this.adminLoading = true;
      // 查询该学院的管理员
      listUserAdmin({
        pageNum: this.adminQueryParams.pageNum,
        pageSize: this.adminQueryParams.pageSize,
        collegeId: this.adminQueryParams.collegeId,
        roleId: 101  // 学院管理员角色ID
      }).then(response => {
        this.adminList = response.rows;
        this.adminTotal = response.total;
        this.adminLoading = false;
      });
    },

    /** 重置管理员密码 */
    handleResetPwd(row) {
      this.$prompt('请输入新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPattern: /^.{6,20}$/,
        inputErrorMessage: '密码长度必须介于 6 和 20 之间'
      }).then(({ value }) => {
        resetUserPwd(row.userId, value).then(response => {
          this.$modal.msgSuccess("重置密码成功");
        });
      }).catch(() => {});
    },

    /** 新增管理员按钮 */
    handleAddAdmin() {
      this.resetAdminForm();
      this.adminForm.collegeId = this.currentCollege.collegeId;
      this.adminAddOpen = true;
    },

    /** 重置管理员表单 */
    resetAdminForm() {
      this.adminForm = {
        userName: '',
        nickName: '',
        phonenumber: '',
        email: '',
        password: '',
        collegeId: null,
        roleIds: [101], // 学院管理员角色ID
        status: "0"
      };
      if (this.$refs.adminForm) {
        this.$refs.adminForm.resetFields();
      }
    },

    /** 取消添加管理员 */
    cancelAdmin() {
      this.adminAddOpen = false;
      this.resetAdminForm();
    },

    /** 提交管理员表单 */
    submitAdminForm() {
      this.$refs.adminForm.validate(valid => {
        if (valid) {
          addUser(this.adminForm).then(response => {
            this.$modal.msgSuccess("新增管理员成功");
            this.adminAddOpen = false;
            this.getAdminList();
          });
        }
      });
    },

    /** 删除管理员 */
    handleDeleteAdmin(row) {
      this.$modal.confirm('确认要删除该管理员吗？').then(() => {
        return delUser(row.userId);
      }).then(() => {
        this.getAdminList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },

    /** 修改管理员状态 */
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.userName + '"管理员吗？').then(function() {
        return changeUserStatus(row.userId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    /** 查询学院列表 */
    getList() {
      this.loading = true;
      listCollege(this.queryParams).then(response => {
        this.collegeList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 新增头像上传处理方法
    handleAvatarSuccess(res, file) {
      if (res.code === 200) {
        this.form.collegeAvatar = res.url;
        this.$message.success("上传成功");
      } else {
        this.$message.error("上传失败");
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    // 表单重置
    reset() {
      this.form = {
        collegeId: null,
        collegeName: null,
        collegeAvatar: null
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
      this.ids = selection.map(item => item.collegeId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加学院";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const collegeId = row.collegeId || this.ids
      getCollege(collegeId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改学院";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.collegeId != null) {
            updateCollege(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCollege(this.form).then(response => {
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
      const collegeIds = row.collegeId || this.ids;
      this.$modal.confirm('是否确认删除学院编号为"' + collegeIds + '"的数据项？').then(function() {
        return delCollege(collegeIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/college/export', {
        ...this.queryParams
      }, `college_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
}

.toolbar-container {
  margin-bottom: 15px;
}
.info-item i {
  margin-right: 8px;
  color: #409EFF;
}
</style>
