<template>
  <div class="kz-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="课程名称" prop="kzName">
        <el-input
          v-model="queryParams.kzName"
          placeholder="课组名称"
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

      <el-card class="toolbar-container" shadow="hover">
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              v-hasPermi="['system:kz:add']"
            >新增</el-button>
          </el-col>
<!--          <el-col :span="1.5">-->
<!--            <el-button-->
<!--              type="success"-->
<!--              icon="el-icon-edit"-->
<!--              size="mini"-->
<!--              :disabled="single"-->
<!--              @click="handleUpdate"-->
<!--              v-hasPermi="['system:kz:edit']"-->
<!--            >修改课组</el-button>-->
<!--          </el-col>-->
          <el-col :span="1.5">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['system:kz:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['system:kz:export']"
            >导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </el-card>
      <!-- 数据展示区域 -->
      <!-- 数据展示区域 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="kzList"
          @selection-change="handleSelectionChange"
          border
          stripe
          highlight-current-row
          row-key="kzId"
          class="responsive-table"
        >
          <el-table-column type="selection" width="50" fixed="left" />
          <el-table-column type="index" label="序号" width="50" fixed="left" />
<!--          <el-table-column label="ID" align="center" prop="kzId" width="80" />-->
          <!-- 添加学院名称列 -->
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
            label="课组名称"
            align="center"
            prop="kzName"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <el-tag size="medium">{{ scope.row.kzName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                type="text"
                icon="el-icon-edit"
                size="mini"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['system:kz:edit']"
              >修改</el-button>
              <el-button
                type="text"
                icon="el-icon-delete"
                size="mini"
                @click="handleDelete(scope.row)"
                v-hasPermi="['system:kz:remove']"
              >删除</el-button>
            </template>
          </el-table-column>
          <!-- ... existing code ... -->
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

    <!-- 添加或修改课组信息对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="课组名称" prop="kzName">
          <el-input v-model="form.kzName" placeholder="请输入课组名称" />
        </el-form-item>
        <el-form-item label="所属学院" prop="collegeId">
          <el-select
            v-model="form.collegeId"
            filterable
            placeholder="请选择所属学院"
            style="width: 100%"
          >
            <el-option
              v-for="item in collegeOptions"
              :key="item.collegeId"
              :label="item.collegeName"
              :value="item.collegeId"
            />
          </el-select>
        </el-form-item>
<!--        <el-form-item label="知识库名称" prop="kzDatasets">-->
<!--          <el-select-->
<!--            v-model="form.kzDatasets"-->
<!--            filterable-->
<!--            allow-create-->
<!--            default-first-option-->
<!--            placeholder="请选择或输入知识库名称"-->
<!--            style="width: 100%"-->
<!--          >-->
<!--            <el-option-->
<!--              v-for="item in datasetsOptions"-->
<!--              :key="item"-->
<!--              :label="item"-->
<!--              :value="item"-->
<!--            />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 查看课组详情对话框 -->
    <el-dialog
      title="课组详情"
      :visible.sync="viewDialogVisible"
      width="500px"
      append-to-body
      :destroy-on-close="true"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课组ID">{{ viewData.kzId }}</el-descriptions-item>
        <el-descriptions-item label="课组名称">{{ viewData.kzName }}</el-descriptions-item>
        <el-descriptions-item label="所属学院">{{ viewData.collegeName || '未分配' }}</el-descriptions-item>

        <!--        <el-descriptions-item label="知识库名称">{{ viewData.kzDatasets }}</el-descriptions-item>-->
        <el-descriptions-item label="创建者">{{ viewData.createBy || '未知' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewData.createTime || '未知' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listKz, getKz, delKz, addKz, updateKz } from "@/api/system/kz";
import { listCollege } from "@/api/system/college"; // 导入学院列表API

export default {
  name: "Kz",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 提交按钮加载状态
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
      // 课组信息表格数据
      kzList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查看详情弹窗
      viewDialogVisible: false,
      // 当前查看的数据
      viewData: {},
      // 知识库选项
      datasetsOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        kzName: null,
        kzDatasets: null,
        collegeId: null, // 添加学院ID查询参数
      },
      // 表单参数
      form: {},
      collegeOptions: [],
      // 表单校验
      rules: {
        kzName: [
          { required: true, message: "课组名称不能为空", trigger: "blur" },
          { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
        ],
        collegeId: [
          { required: true, message: "请选择所属学院", trigger: "change" }
        ]
        // ,
        // kzDatasets: [
        //   { required: true, message: "知识库名称不能为空", trigger: "change" }
        // ]
      }
    };
  },
  created() {
    this.getCollegeOptions(); // 获取学院选项
    this.getList();
  },
  methods: {
    /** 获取学院选项列表 */
    getCollegeOptions() {
      listCollege({ pageSize: 100 }).then(response => {
        this.collegeOptions = response.rows;
        // 重要：加载学院选项后重新加载课组列表，以便正确关联学院名称
        if (this.kzList.length > 0) {
          this.mapCollegeNames();
        }
      });
    },
    /** 将学院ID映射为学院名称 */
    mapCollegeNames() {
      this.kzList = this.kzList.map(kz => {
        const college = this.collegeOptions.find(c => c.collegeId === kz.collegeId);
        return {
          ...kz,
          collegeName: college ? college.collegeName : '未分配'
        };
      });
    },
    /** 查询课组信息列表 */
    getList() {
      this.loading = true;
      listKz(this.queryParams).then(response => {
        // 获取到课组列表数据后，将学院ID映射为学院名称
        const kzListWithCollegeName = response.rows.map(kz => {
          // 查找对应的学院信息
          const college = this.collegeOptions.find(c => c.collegeId === kz.collegeId);
          // 添加学院名称属性
          return {
            ...kz,
            collegeName: college ? college.collegeName : '未分配'
          };
        });

        this.kzList = kzListWithCollegeName;
        this.total = response.total;
        this.loading = false;
        // 提取知识库名称作为选项
        this.extractDatasetsOptions();
      });
    },
    // 提取知识库名称选项
    extractDatasetsOptions() {
      const datasets = new Set();
      this.kzList.forEach(item => {
        if (item.kzDatasets) {
          datasets.add(item.kzDatasets);
        }
      });
      this.datasetsOptions = Array.from(datasets);
    },
    // 获取唯一知识库数量
    getUniqueDatasets() {
      const datasets = new Set();
      this.kzList.forEach(item => {
        if (item.kzDatasets) {
          datasets.add(item.kzDatasets);
        }
      });
      return datasets.size;
    },
    /** 查看详情 */
    handleView(row) {
      // 确保详情视图中显示学院名称
      const college = this.collegeOptions.find(c => c.collegeId === row.collegeId);
      this.viewData = {
        ...row,
        collegeName: college ? college.collegeName : '未分配'
      };
      this.viewDialogVisible = true;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        kzId: null,
        kzName: null,
        collegeId: null, // 重置学院ID
        kzDatasets: null,
        createBy: null,
        createTime: null
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
      this.ids = selection.map(item => item.kzId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加课组信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const kzId = row.kzId || this.ids;
      getKz(kzId).then(response => {
        this.form = response.data;
        // 确保表单中有正确的学院ID
        if (!this.form.collegeId && row.collegeId) {
          this.form.collegeId = row.collegeId;
        }
        this.open = true;
        this.title = "修改课组信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.form.kzId != null) {
            updateKz(this.form).then(response => {
              this.$notify({
                title: '成功',
                message: '修改成功',
                type: 'success',
                duration: 2000
              });
              this.open = false;
              this.getList();
              this.submitLoading = false;
            }).catch(() => {
              this.submitLoading = false;
            });
          } else {
            addKz(this.form).then(response => {
              this.$notify({
                title: '成功',
                message: '新增成功',
                type: 'success',
                duration: 2000
              });
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
      const kzIds = row.kzId || this.ids;
      this.$confirm('是否确认删除课组信息编号为"' + kzIds + '"的数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return delKz(kzIds);
      }).then(() => {
        this.getList();
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        });
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有课组数据项?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.download('system/kz/export', {
          ...this.queryParams
        }, `课组数据_${new Date().getTime()}.xlsx`);
      });
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
.info-item i {
  margin-right: 8px;
  color: #409EFF;
}
</style>
