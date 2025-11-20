<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="课程" prop="classId">
        <el-select v-model="queryParams.classId" placeholder="请选择课程" clearable>
          <el-option
            v-for="item in classOptions"
            :key="item.classId"
            :label="item.className"
            :value="item.classId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="教师" prop="teacherId">
        <el-select v-model="queryParams.teacherId" placeholder="请选择教师" clearable>
          <el-option
            v-for="item in teacherOptions"
            :key="item.userId"
            :label="item.nickName"
            :value="item.userId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入教学设计标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:design:add']"
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
          v-hasPermi="['system:design:edit']"
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
          v-hasPermi="['system:design:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格展示 -->
    <el-table v-loading="loading" :data="designList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" />
      <el-table-column label="教学设计标题" align="center" prop="title" />
      <el-table-column label="课程" align="center" width="180">
        <template slot-scope="scope">
          {{ getClassName(scope.row.classId) }}
        </template>
      </el-table-column>
      <el-table-column label="教师" align="center" width="120">
        <template slot-scope="scope">
          {{ getTeacherName(scope.row.teacherId) }}
        </template>
      </el-table-column>
      <el-table-column label="版本号" align="center" prop="version" width="80" />
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '已完成' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:design:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:design:remove']"
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

    <!-- 添加或修改教学设计对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="课程" prop="classId">
          <el-select v-model="form.classId" placeholder="请选择课程" style="width: 100%">
            <el-option
              v-for="item in classOptions"
              :key="item.classId"
              :label="item.className"
              :value="Number(item.classId)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教师" prop="teacherId">
          <el-select v-model="form.teacherId" placeholder="请选择教师" style="width: 100%">
            <el-option
              v-for="item in teacherOptions"
              :key="item.userId"
              :label="item.nickName"
              :value="Number(item.userId)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教学设计标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入教学设计标题" />
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input-number v-model="form.version" :min="1" :precision="0" style="width: 120px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="AI提示词" prop="prompt">
          <el-input v-model="form.prompt" type="textarea" rows="3" placeholder="请输入提示词内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 教学设计详情对话框 -->
    <el-dialog title="教学设计详情" :visible.sync="detailVisible" width="80%" append-to-body>
      <el-card v-loading="detailLoading">
        <div slot="header">
          <h3>{{ detailInfo.design && detailInfo.design.title || '教学设计详情' }}</h3>
          <div class="design-meta">
            <span>课程: {{ getClassName(detailInfo.design && detailInfo.design.classId) }}</span> |
            <span>教师: {{ getTeacherName(detailInfo.design && detailInfo.design.teacherId) }}</span> |
            <span>版本: {{ detailInfo.design && detailInfo.design.version }}</span> |
            <span>状态: {{ detailInfo.design && detailInfo.design.status === 1 ? '已完成' : '草稿' }}</span>
          </div>
        </div>

        <el-tabs type="border-card">
          <el-tab-pane label="课程概述和设计目标">
            <div class="content-section" v-if="detailInfo.contents && detailInfo.contents.overview">
              <pre>{{ detailInfo.contents.overview }}</pre>
            </div>
            <el-empty v-else description="暂无内容" />
          </el-tab-pane>

          <el-tab-pane label="课程章节">
            <div class="content-section" v-if="detailInfo.contents && detailInfo.contents.chapters">
              <pre>{{ detailInfo.contents.chapters }}</pre>
            </div>
            <el-empty v-else description="暂无内容" />
          </el-tab-pane>

          <el-tab-pane label="考核方案">
            <div class="content-section" v-if="detailInfo.contents && detailInfo.contents.assessment">
              <pre>{{ detailInfo.contents.assessment }}</pre>
            </div>
            <el-empty v-else description="暂无内容" />
          </el-tab-pane>

          <el-tab-pane label="评分详细标准">
            <div class="content-section" v-if="detailInfo.contents && detailInfo.contents.scoring">
              <pre>{{ detailInfo.contents.scoring }}</pre>
            </div>
            <el-empty v-else description="暂无内容" />
          </el-tab-pane>

          <el-tab-pane label="预计成果">
            <div class="content-section" v-if="detailInfo.contents && detailInfo.contents.outcome">
              <pre>{{ detailInfo.contents.outcome }}</pre>
            </div>
            <el-empty v-else description="暂无内容" />
          </el-tab-pane>
        </el-tabs>

        <div class="action-buttons">
          <el-button type="primary" @click="handlePrint">打印</el-button>
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </el-card>
    </el-dialog>
  </div>
</template>

<script>
import { listDesign, getDesign, delDesign, addDesign, updateDesign } from "@/api/system/design";
import { listTeacherForClass } from "@/api/system/teacher";
import { listClass } from "@/api/system/class";
import { listContent } from '@/api/system/content'

export default {
  name: "Design",
  data() {
    return {
      // 遮罩层
      loading: true,
      detailLoading: false,
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
      // 教学设计主表格数据
      designList: [],
      // 教师选项
      teacherOptions: [],
      // 课程选项
      classOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 详情弹窗可见
      detailVisible: false,
      // 详情信息
      detailInfo: {
        design: {},
        contents: {}
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        classId: null,
        teacherId: null,
        title: null,
        version: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        classId: [
          { required: true, message: "课程不能为空", trigger: "change" }
        ],
        teacherId: [
          { required: true, message: "教师不能为空", trigger: "change" }
        ],
        title: [
          { required: true, message: "教学设计标题不能为空", trigger: "blur" }
        ],
        version: [
          { required: true, message: "版本号不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "change" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getTeacherOptions();
    this.getClassOptions();
  },
  methods: {
    /** 查询教学设计主列表 */
    getList() {
      this.loading = true;
      listDesign(this.queryParams).then(response => {
        this.designList = response.rows;
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
      if (!teacherId) return "未知教师";
      const teacher = this.teacherOptions.find(item => Number(item.userId) === Number(teacherId));
      return teacher ? teacher.nickName : "未知教师";
    },

    /** 根据ID获取课程名称 */
    getClassName(classId) {
      if (!classId) return "未知课程";
      const classItem = this.classOptions.find(item => Number(item.classId) === Number(classId));
      return classItem ? classItem.className : "未知课程";
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
        classId: null,
        teacherId: null,
        title: null,
        version: 1,
        prompt: null,
        status: 0,
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
      this.title = "添加教学设计";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getDesign(id).then(response => {
        this.form = response.data;
        if (this.form.teacherId) {
          this.form.teacherId = Number(this.form.teacherId);
        }
        if (this.form.classId) {
          this.form.classId = Number(this.form.classId);
        }
        if (this.form.status === null || this.form.status === undefined) {
          this.form.status = 0;
        }
        this.open = true;
        this.title = "修改教学设计";
      });
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateDesign(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDesign(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除教学设计编号为"' + ids + '"的数据项？').then(function() {
        return delDesign(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('system/design/export', {
        ...this.queryParams
      }, `design_${new Date().getTime()}.xlsx`)
    },

    /** 查看详情操作 */
    /** 查看详情操作 */
    handleDetail(row) {
      this.detailLoading = true;
      this.detailVisible = true;
      this.detailInfo = { design: {}, contents: {} };

      getDesign(row.id).then(response => {
        const { data } = response;
        if (!data) return;

        // 查询详情内容 - 使用listContent API
        listContent({
          designId: row.id,
          pageSize: 100
        }).then(res => {
          if (res.rows && res.rows.length > 0) {
            // 组织内容数据
            const contents = {};
            res.rows.forEach(item => {
              contents[item.contentType] = item.content;
            });
            this.detailInfo.contents = contents;
          }
          this.detailInfo.design = data;
          this.detailLoading = false;
        }).catch(() => {
          this.detailLoading = false;
        });
      }).catch(() => {
        this.detailLoading = false;
      });
    },

    /** 打印教学设计 */
    handlePrint() {
      const design = this.detailInfo.design || {};
      const contents = this.detailInfo.contents || {};

      let printWindow = window.open('', '_blank');
      let content = `
        <html>
        <head>
          <title>${design.title || '教学设计'}</title>
          <style>
            body { font-family: SimSun, serif; padding: 20px; line-height: 1.6; }
            h1 { text-align: center; margin-bottom: 20px; }
            h2 { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px; }
            .meta { text-align: center; color: #666; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .content { white-space: pre-wrap; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px">
            <button onclick="window.print()">打印</button>
            <button onclick="window.close()">关闭</button>
          </div>
          <h1>${design.title || '教学设计'}</h1>
          <div class="meta">
            课程: ${this.getClassName(design.classId)} |
            教师: ${this.getTeacherName(design.teacherId)} |
            版本: ${design.version || '1'}
          </div>

          <div class="section">
            <h2>课程概述和设计目标</h2>
            <div class="content">${contents.overview || '无内容'}</div>
          </div>

          <div class="section">
            <h2>课程章节</h2>
            <div class="content">${contents.chapters || '无内容'}</div>
          </div>

          <div class="section">
            <h2>考核方案</h2>
            <div class="content">${contents.assessment || '无内容'}</div>
          </div>

          <div class="section">
            <h2>评分详细标准</h2>
            <div class="content">${contents.scoring || '无内容'}</div>
          </div>

          <div class="section">
            <h2>预计成果</h2>
            <div class="content">${contents.outcome || '无内容'}</div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();
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

.design-meta {
  margin-top: 10px;
  color: #666;
}

.content-section {
  padding: 15px;
  line-height: 1.6;
  font-size: 14px;
}

.content-section pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}

.action-buttons {
  margin-top: 20px;
  text-align: center;
}
</style>
