<template>
  <div class="app-container">

    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="课程名称" prop="className">
        <el-input
          v-model="queryParams.className"
          placeholder="请输入课程名称"
          clearable
          prefix-icon="el-icon-reading"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="课组" prop="kzId">
        <el-select v-model="queryParams.kzId" placeholder="请选择课组" clearable style="width: 220px">
          <el-option
            v-for="item in kzOptions"
            :key="item.kzId"
            :label="item.kzName"
            :value="item.kzId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="教师" prop="teacherId">
        <el-select v-model="queryParams.teacherId" placeholder="请选择教师" clearable style="width: 220px">
          <el-option
            v-for="item in teacherOptions"
            :key="item.userId"
            :label="item.nickName"
            :value="item.userId"
          >
            <div class="user-item">
              <el-avatar :size="24" :src="item.avatar || defaultAvatar">{{ item.nickName.substr(0, 1) }}</el-avatar>
              <span style="margin-left: 8px">{{ item.nickName }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏区域 -->
    <el-card class="toolbar-container" shadow="hover">
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:class:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:class:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['system:class:export']"
          >导出</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
    </el-card>

    <!-- 瓷片展示区域 -->
    <div v-loading="loading" class="class-tiles-container">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in classList" :key="item.classId">
          <el-card shadow="hover" :body-style="{ padding: '0px' }" class="class-card">
            <div class="class-card-header" :class="'bg-color-' + (item.classId % 5)">
              <el-checkbox
                v-model="item.isSelected"
                @change="(val) => handleSelectChange(val, item)"
              ></el-checkbox>
              <span class="class-status">
                <el-tag :type="item.status === '0' ? 'success' : 'danger'" size="mini">
                  {{ item.status === '0' ? '正常' : '停用' }}
                </el-tag>
              </span>
            </div>
            <div class="class-card-body">
              <h3 class="class-name" :title="item.className">{{ item.className }}</h3>
              <div class="class-info">
                <div class="info-item">
                  <i class="el-icon-s-cooperation"></i>
                  <span>课组: {{ getKzName(item.kzId) }}</span>
                </div>
                <div class="info-item">
                  <i class="el-icon-user"></i>
                  <span>教师: {{ item.teacherName }}</span>
                </div>
              </div>
            </div>
            <div class="class-card-actions">
              <el-button
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(item)"
                v-hasPermi="['system:class:edit']"
              >修改</el-button>
              <el-button
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(item)"
                v-hasPermi="['system:class:remove']"
              >删除</el-button>
              <el-button
                type="text"
                icon="el-icon-more"
                @click="handleViewDetails(item)"
              >详情</el-button>
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

    <!-- 添加或修改课程记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="课程名称" prop="className">
          <el-input v-model="form.className" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="所属课组" prop="kzId">
          <el-select v-model="form.kzId" placeholder="请选择课组" style="width: 100%">
            <el-option
              v-for="item in kzOptions"
              :key="item.kzId"
              :label="item.kzName"
              :value="item.kzId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="授课教师" prop="teacherId">
          <el-select v-model="form.teacherId" placeholder="请选择教师" style="width: 100%">
            <el-option
              v-for="item in teacherOptions"
              :key="item.userId"
              :label="item.nickName"
              :value="Number(item.userId)"
            >
              <div class="user-item">
                <el-avatar :size="24" :src="item.avatar || defaultAvatar">{{ item.nickName.substr(0, 1) }}</el-avatar>
                <span style="margin-left: 8px">{{ item.nickName }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 课程详情对话框 -->
    <el-dialog title="课程详情" :visible.sync="detailsOpen" width="600px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程名称">{{ detailsForm.className }}</el-descriptions-item>
        <el-descriptions-item label="所属课组">{{ getKzName(detailsForm.kzId) }}</el-descriptions-item>
        <el-descriptions-item label="授课教师">{{ detailsForm.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailsForm.status === '0' ? 'success' : 'danger'">
            {{ detailsForm.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailsForm.createTime }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailsOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listClass, getClass, delClass, addClass, updateClass } from "@/api/system/class";
import { listUser } from "@/api/system/user"; // 假设这是获取教师（用户）列表的API
import { listKz } from "@/api/system/kz";
import { listTeacher, listTeacherForClass } from '@/api/system/teacher' // 假设这是获取课组列表的API

export default {
  name: "Class",
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
      // 课程记录表格数据
      classList: [],
      // 教师选项
      teacherOptions: [],
      // 课组选项
      kzOptions: [],
      // 默认头像
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 详情对话框
      detailsOpen: false,
      detailsForm: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 12, // 每页显示更多卡片
        className: null,
        kzId: null,
        teacherName: null,
        teacherId: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        className: [
          { required: true, message: "课程名称不能为空", trigger: "blur" }
        ],
        kzId: [
          { required: true, message: "所属课组不能为空", trigger: "change" }
        ],
        teacherId: [
          { required: true, message: "授课教师不能为空", trigger: "change" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getTeacherOptions();
    this.getKzOptions();
  },
  methods: {
    /** 查询课程记录列表 */
    getList() {
      this.loading = true;
      listClass(this.queryParams).then(response => {
        this.classList = response.rows.map(item => {
          return {
            ...item,
            isSelected: false
          };
        });
        this.total = response.total;
        this.loading = false;
      });
    },

    /** 获取教师选项 */
    getTeacherOptions() {
      listTeacherForClass({ pageSize: 100 }).then(response => {
        this.teacherOptions = response.rows.map(item => ({
          userId: item.teacherId,         // 映射 teacherId 到 userId
          nickName: item.teacherName,     // 映射 teacherName 到 nickName
          teacherNo: item.teacherNo,      // 保留 teacherNo 供后续使用
        }));
      });
    },

    /** 获取课组选项 */
    getKzOptions() {
      listKz({ pageSize: 100 }).then(response => {
        this.kzOptions = response.rows;
      });
    },

    /** 根据ID获取教师名称 */
    getTeacherName(teacherId) {
      const teacher = this.teacherOptions.find(item => item.userId === teacherId);
      return teacher ? teacher.nickName : teacherId;
    },

    /** 根据ID获取课组名称 */
    getKzName(kzId) {
      const kz = this.kzOptions.find(item => item.kzId === kzId);
      return kz ? kz.kzName : kzId;
    },

    /** 处理选择变更 */
    handleSelectChange(val, item) {
      if (val) {
        this.ids.push(item.classId);
      } else {
        this.ids = this.ids.filter(id => id !== item.classId);
      }
      this.single = this.ids.length !== 1;
      this.multiple = this.ids.length === 0;
    },

    /** 查看详情 */
    handleViewDetails(row) {
      this.detailsForm = { ...row };
      this.detailsOpen = true;
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },

    // 表单重置
    reset() {
      this.form = {
        classId: null,
        className: null,
        kzId: null,
        teacherId: null,
        status: "0",
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
      this.title = "添加课程";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const classId = row.classId || this.ids[0];
      getClass(classId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改课程";
      });
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.classId != null) {
            updateClass(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addClass(this.form).then(response => {
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
      const classIds = row.classId || this.ids.join(',');
      this.$modal.confirm('是否确认删除课程？').then(function() {
        return delClass(classIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('system/class/export', {
        ...this.queryParams
      }, `class_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped>
.app-container {
  padding: 10px;
}

.filter-container {
  margin-bottom: 15px;
}

.toolbar-container {
  margin-bottom: 15px;
}

.class-tiles-container {
  margin-bottom: 20px;
}

.class-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 8px;
  overflow: hidden;
}

.class-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.class-card-header {
  height: 60px;
  padding: 15px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bg-color-0 { background: linear-gradient(135deg, #1bbc9b 0%, #16a086 100%); }
.bg-color-1 { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); }
.bg-color-2 { background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); }
.bg-color-3 { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
.bg-color-4 { background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); }

.class-card-body {
  padding: 15px;
  min-height: 120px;
}

.class-name {
  margin: 0 0 15px 0;
  font-size: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.class-info {
  color: #666;
  font-size: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item i {
  margin-right: 8px;
  color: #409EFF;
}

.class-card-actions {
  display: flex;
  justify-content: space-around;
  padding: 10px 15px;
  border-top: 1px solid #eee;
}

.class-status {
  position: relative;
  top: -8px;
}

.user-item {
  display: flex;
  align-items: center;
}
</style>
