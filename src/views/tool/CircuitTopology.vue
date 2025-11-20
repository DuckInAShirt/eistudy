<template>
  <div class="topology-canvas" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
    <div class="topology-title" :style="titleStyle">电路分析基础</div>
    <svg :width="canvasWidth" :height="canvasHeight" class="topology-svg">
      <line
        v-for="(edge, idx) in edges"
        :key="idx"
        :x1="edge.x1" :y1="edge.y1"
        :x2="edge.x2" :y2="edge.y2"
        stroke="#bbb" stroke-width="4"
      />
    </svg>
    <div
      v-for="node in nodes"
      :key="node.node_id"
      class="node"
      :class="nodeClass(node)"
      :style="nodeStyle(node)"
      @mouseenter="showTooltip(node)"
      @mouseleave="hideTooltip"
      @click="onNodeClick(node)"
    >
      <span class="node-title">{{ node.node_title.length > 8 ? node.node_title.slice(0,8)+'...' : node.node_title }}</span>
    </div>
    <div v-if="tooltip.visible" ref="tooltip" class="node-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <strong>{{ tooltipNodeTitle() }}</strong><br>
      状态：{{ tooltipNodeStatus() }}<br>
      前置知识点：{{ tooltipNodePrereqs() }}<br>
      后续知识点：{{ tooltipNodeNexts() }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nodes: [],
      edges: [],
      nodeMap: {},
      canvasWidth: 1200,
      canvasHeight: 800,
      nodeSize: 70,
      hSpacing: 160,
      vSpacing: 140,
      padding: 40,
      tooltip: { visible: false, x: 0, y: 0, node: null }
    }
  },
  computed: {
    titleStyle() {
      return {
        left: this.padding + 'px',
        width: (this.canvasWidth - 2 * this.padding) + 'px'
      };
    }
  },
  mounted() {
    this.initTopology();
    window.addEventListener('resize', this.initTopology);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.initTopology);
  },
  methods: {
    initTopology() {
      // 节点数据
      const nodes = [
        { node_id: '01', node_title: '集总参数电路模型', prerequisites: [], status: 'completed' },
        { node_id: '02', node_title: '电路的基本变量，基尔霍夫电压定律、基尔霍夫电流定律', prerequisites: ['01'], status: 'available' },
        { node_id: '03', node_title: '电阻元件，电压源，电流源，受控源，输入电阻，电源的等效变换', prerequisites: ['02'], status: 'available' },
        { node_id: '04', node_title: '完备的独立电路变量', prerequisites: ['02'], status: 'available' },
        { node_id: '05', node_title: '节点电压法，网孔电流法', prerequisites: ['04'], status: 'available' },
        { node_id: '06', node_title: '齐性定理，叠加定理，替代定理', prerequisites: ['05'], status: 'available' },
        { node_id: '07', node_title: '戴维南定理，诺顿定理', prerequisites: ['06'], status: 'available' },
        { node_id: '08', node_title: '电容元件，电感元件，换路定则，初始值的确定', prerequisites: ['03'], status: 'available' },
        { node_id: '09', node_title: '一阶电路的零输入响应、一阶电路零状态响应', prerequisites: ['08'], status: 'available' },
        { node_id: '10', node_title: '一阶电路的全响应，三要素法', prerequisites: ['09'], status: 'available' },
        { node_id: '11', node_title: 'RLC并联电路的零输入响应', prerequisites: ['10'], status: 'available' },
        { node_id: '12', node_title: '正弦量的相量，R、L、C元件VCR的相量形式，阻抗和导纳', prerequisites: ['08'], status: 'available' },
        { node_id: '13', node_title: '正弦稳态电路的相量分析', prerequisites: ['12'], status: 'available' },
        { node_id: '14', node_title: '正弦稳态电路的功率，最大功率传输定理', prerequisites: ['13'], status: 'available' },
        { node_id: '15', node_title: '非正弦周期信号，非正弦周期稳态电路的分析', prerequisites: ['13'], status: 'available' },
        { node_id: '16', node_title: '网络函数，RC电路的频率特性，高通、低通、带通滤波器的概念', prerequisites: ['13'], status: 'available' },
        { node_id: '17', node_title: 'RLC串联电路的谐振', prerequisites: ['13'], status: 'available' },
        { node_id: '18', node_title: '互感元件，互感电压，耦合电感的VCR', prerequisites: ['08'], status: 'available' },
        { node_id: '19', node_title: '耦合电感的去耦，耦合电感电路的分析：去耦等效', prerequisites: ['18'], status: 'available' },
        { node_id: '20', node_title: '理想变压器的VCR、以及性质', prerequisites: ['19'], status: 'available' },
        { node_id: '21', node_title: '双口网络的Z参数、Y参数，H、A参数', prerequisites: ['13'], status: 'available' }
      ];
      // 计算层级
      const levels = {};
      const nodeMap = {};
      nodes.forEach(node => {
        nodeMap[node.node_id] = node;
        let level = 0;
        if (node.prerequisites.length > 0) {
          level = Math.max.apply(null, node.prerequisites.map(pid => (levels[pid] || 0) + 1));
        }
        levels[node.node_id] = level;
        node._level = level;
      });
      // 分层
      const maxLevel = Math.max.apply(null, Object.values(levels));
      const nodesByLevel = Array.from({length: maxLevel+1}, () => []);
      nodes.forEach(node => {
        nodesByLevel[node._level].push(node);
      });
      // 计算画布宽高、节点大小、间距（自适应）
      const minCanvasW = 900, minCanvasH = 600, maxCanvasW = 1600, maxCanvasH = 1400;
      const maxNodesInLevel = Math.max.apply(null, nodesByLevel.map(arr => arr.length));
      const winW = window.innerWidth * 0.85;
      const winH = window.innerHeight * 0.85;
      const canvasWidth = Math.max(minCanvasW, Math.min(maxCanvasW, winW, maxNodesInLevel * 140));
      const canvasHeight = Math.max(minCanvasH, Math.min(maxCanvasH, winH, (maxLevel+1) * 140));
      const padding = Math.max(20, Math.min(40, canvasWidth * 0.03));
      const nodeSize = Math.max(90, Math.min(140, Math.min(canvasWidth, canvasHeight) * 0.12));
      const hSpacing = (canvasWidth - 2 * padding) / Math.max(1, maxNodesInLevel - 1);
      const vSpacing = (canvasHeight - 2 * padding) / Math.max(1, maxLevel);
      // 节点坐标（相对于可用区域进行居中：canvas 去掉左右 padding 后）
      const innerWidth = canvasWidth - 2 * padding;
      nodesByLevel.forEach((levelNodes, levelIdx) => {
        const totalWidth = (levelNodes.length - 1) * hSpacing;
        levelNodes.forEach((node, idx) => {
          node.x = padding + (innerWidth / 2 - totalWidth / 2) + idx * hSpacing - nodeSize / 2;
          node.y = padding + levelIdx * vSpacing;
        });
      });
      // 连线
      const edges = [];
      nodes.forEach(node => {
        node.prerequisites.forEach(pid => {
          const from = nodeMap[pid];
          const to = node;
          if (from && to) {
            edges.push({
              x1: from.x + nodeSize/2,
              y1: from.y + nodeSize/2,
              x2: to.x + nodeSize/2,
              y2: to.y + nodeSize/2
            });
          }
        });
      });
      this.nodes = nodes;
      this.edges = edges;
      this.nodeMap = nodeMap;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.nodeSize = nodeSize;
      this.hSpacing = hSpacing;
      this.vSpacing = vSpacing;
      this.padding = padding;
    },
    nodeStyle(node) {
      return {
        left: node.x + 'px',
        top: node.y + 'px',
        width: this.nodeSize + 'px',
        height: this.nodeSize + 'px',
        fontSize: (this.nodeSize * 0.10 + 6) + 'px',
        lineHeight: this.nodeSize + 'px',
      };
    },
    showTooltip(node) {
      this.$nextTick(() => {
        // 说明栏宽高（与样式一致，或用ref获取）
        const tooltipWidth = 320;
        const tooltipHeight = this.$refs.tooltip ? this.$refs.tooltip.offsetHeight : 120;
        let left = node.x + this.nodeSize + 20;
        let top = node.y;
        // 右侧溢出
        if (left + tooltipWidth > this.canvasWidth) {
          left = node.x - tooltipWidth - 20;
          if (left < 10) left = 10;
        }
        // 下方溢出
        if (top + tooltipHeight > this.canvasHeight) {
          top = this.canvasHeight - tooltipHeight - 10;
          if (top < 10) top = 10;
        }
        this.tooltip = {
          visible: true,
          x: left,
          y: top,
          node
        };
      });
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
    onNodeClick(node) {
      if (node.status === 'locked') return;
      this.$router.push(`/tool/circuit-test/${node.node_id}`);
    },
    nodeClass(node) {
      if (node.status === 'completed') return 'node-completed';
      if (node.status === 'locked') return 'node-locked';
      return 'node-available';
    },
    tooltipNodeTitle() {
      return this.tooltip.node ? this.tooltip.node.node_title : '';
    },
    tooltipNodeStatus() {
      return this.tooltip.node ? this.tooltip.node.status : '';
    },
    tooltipNodePrereqs() {
      if (!this.tooltip.node) return '';
      return this.tooltip.node.prerequisites
        .map(pid => this.nodeMap[pid] ? this.nodeMap[pid].node_title : pid)
        .join('，');
    },
    tooltipNodeNexts() {
      if (!this.tooltip.node) return '';
      return this.nodes
        .filter(n => n.prerequisites.includes(this.tooltip.node.node_id))
        .map(n => n.node_title)
        .join('，');
    }
  }
}
</script>

<style scoped>
.topology-canvas {
  position: relative;
  background: #f6fafd;
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(52,152,219,0.10), 0 1.5px 8px rgba(0,0,0,0.04);
  margin: 36px auto 0 auto;
  border: none;
  overflow: auto;
  max-width: 1200px;
  min-width: 900px;
  max-height: 90vh;
  padding-bottom: 32px;
  transition: box-shadow 0.2s;
}

.topology-title {
  position: sticky;
  top: 0;
  z-index: 3;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  padding: 14px 0 6px 0;
  background: linear-gradient(#f6fafd, rgba(246,250,253,0.92));
  color: #1b1b1b;
  /* 由计算属性注入 left 与 width 以与可用区域对齐 */
  position: sticky;
}

/* 移除说明栏样式 */
.topology-graph-area, .topology-desc { display: none; }

.topology-graph-area {
  position: relative;
  margin-top: 60px;
}

.topology-svg {
  position: absolute;
  left: 0; top: 0;
  z-index: 1;
  pointer-events: none;
}

.node {
  position: absolute;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 4px 16px rgba(52,152,219,0.10);
  border: 3px solid #fff;
  transition: transform 0.18s, box-shadow 0.18s, border 0.18s;
  user-select: none;
  background-clip: padding-box;
  word-break: break-all;
  padding: 0 4px;
  outline: none;
}

.node-title {
  width: 100%;
  text-align: center;
  display: block;
  white-space: normal;
  word-break: break-all;
  line-height: 1.2;
  font-size: inherit;
  color: inherit;
  text-shadow: none;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.node-available {
  background: #90caf9;
  color: #1976d2; /* 与浅蓝背景协调的深蓝文案色 */
  border: 3px solid #e3f2fd;
}

.node-completed {
  background: #c8e6c9;
  color: #2e7d32; /* 与浅绿背景协调的深绿文案色 */
  border: 3px solid #e8f5e9;
}

.node-locked {
  background: #ffcc02;
  color: #a67c00; /* 与明黄背景协调的深黄文案色 */
  cursor: not-allowed;
  opacity: 0.85;
  border: 3px dashed #f5e79e;
}

.node:hover {
  transform: scale(1.12);
  box-shadow: 0 0 0 8px rgba(102,126,234,0.10), 0 8px 32px rgba(52,152,219,0.18);
  border: 3px solid #ffd700;
  z-index: 10;
  outline: 0;
}

.node-tooltip {
  position: absolute;
  background: #fff;
  border: 1.5px solid #3498db;
  border-radius: 10px;
  padding: 16px 18px;
  box-shadow: 0 4px 24px rgba(52,152,219,0.12);
  z-index: 20;
  width: 320px;
  font-size: 16px;
  color: #222;
  pointer-events: none;
  line-height: 1.7;
}

.node-tooltip strong {
  font-size: 18px;
  color: #3498db;
}

/* 美化滚动条 */
.topology-canvas::-webkit-scrollbar {
  width: 10px;
  background: #e3f2fd;
  border-radius: 8px;
}
.topology-canvas::-webkit-scrollbar-thumb {
  background: #b0bec5;
  border-radius: 8px;
}

.topology-svg line {
  stroke-width: 4;
  stroke: #b0bec5;
  transition: stroke 0.2s;
}
</style> 