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
          @change="handleQuery"
        >
          <el-option
            v-for="item in collegeOptions"
            :key="item.collegeId"
            :label="item.collegeName"
            :value="item.collegeId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="专业名称" prop="majorName">
        <el-input
          v-model="queryParams.majorName"
          placeholder="请输入专业名称"
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
            v-hasPermi="['system:major:add']"
          >新增</el-button>
        </el-col>
<!--        <el-col :span="1.5">-->
<!--          <el-button-->
<!--            type="success"-->
<!--            icon="el-icon-edit"-->
<!--            size="mini"-->
<!--            :disabled="single"-->
<!--            @click="handleUpdate"-->
<!--            v-hasPermi="['system:major:edit']"-->
<!--          >修改</el-button>-->
<!--        </el-col>-->
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:major:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['system:major:export']"
          >导出</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
    </el-card>

    <!-- 数据展示区域 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="majorList"
        @selection-change="handleSelectionChange"
        border
        stripe
        highlight-current-row
        row-key="majorId"
        class="responsive-table"
      >
        <el-table-column type="selection" width="50" fixed="left" />
        <el-table-column type="index" label="序号" width="50" fixed="left" />
<!--        <el-table-column label="ID" align="center" prop="majorId" width="80" />-->
        <el-table-column
          label="专业名称"
          align="center"
          prop="majorName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-tag size="medium">{{ scope.row.majorName }}</el-tag>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-edit"
              size="mini"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:major:edit']"
            >修改</el-button>
            <el-button
              type="text"
              icon="el-icon-delete"
              size="mini"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:major:remove']"
            >删除</el-button>
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

    <!-- 添加或修改专业对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="专业名称" prop="majorName">
          <el-input v-model="form.majorName" placeholder="请输入专业名称" />
        </el-form-item>
        <el-form-item label="所属学院" prop="collegeId">
          <el-select
            v-model="form.collegeId"
            filterable
            placeholder="请选择所属学院"
            style="width: 100%"
          >
            <el-option
              v-for="college in collegeOptions"
              :key="college.collegeId"
              :label="college.collegeName"
              :value="college.collegeId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMajor, getMajor, delMajor, addMajor, updateMajor } from "@/api/system/major";
import { listCollege } from "@/api/system/college";

export default {
  name: "Major",
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
      // 专业表格数据
      majorList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        majorName: null,
        collegeId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        majorName: [
          { required: true, message: "专业名称不能为空", trigger: "blur" }
        ],
        collegeId: [
          { required: true, message: "所属学院不能为空", trigger: "change" }
        ]
      },
      // 学院下拉选项
      collegeOptions: []
    };
  },
  created() {
    this.getCollegeOptions();
    this.getList();
  },
  methods: {
    /** 查询专业列表 */
    getList() {
      this.loading = true;
      listMajor(this.queryParams).then(response => {
        this.majorList = response.rows.map(major => {
          const college = this.collegeOptions.find(c => c.collegeId === major.collegeId);
          return {
            ...major,
            collegeName: college ? college.collegeName : '未分配'
          };
        });
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 获取学院下拉选项 */
    getCollegeOptions() {
      listCollege({ pageSize: 100 }).then(response => {
        this.collegeOptions = response.rows;
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
      this.queryParams.majorName = null;
      this.queryParams.collegeId = null;
      this.handleQuery();
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.majorId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加专业";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const majorId = row.majorId || this.ids;
      getMajor(majorId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改专业";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.majorId != null) {
            updateMajor(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMajor(this.form).then(response => {
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
      const majorIds = row.majorId || this.ids;
      this.$modal.confirm('是否确认删除专业编号为"' + majorIds + '"的数据项？').then(() => {
        return delMajor(majorIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/major/export', {
        ...this.queryParams
      }, `major_${new Date().getTime()}.xlsx`);
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置 */
    reset() {
      this.form = {
        majorId: null,
        majorName: null,
        collegeId: null
      };
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
</style>
