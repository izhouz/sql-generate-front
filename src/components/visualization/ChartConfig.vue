<template>
  <div class="chart-config">
    <el-drawer
      v-model="visible"
      :title="title"
      size="400px"
      :destroy-on-close="true"
    >
      <el-form :model="config" label-width="100px">
        <!-- 基础配置 -->
        <el-form-item label="主题">
          <el-select v-model="config.theme" placeholder="选择主题">
            <el-option label="默认" value="default" />
            <el-option label="亮色" value="light" />
            <el-option label="暗色" value="dark" />
          </el-select>
        </el-form-item>

        <el-form-item label="动画">
          <el-switch v-model="config.animation" />
        </el-form-item>

        <!-- 图表特定配置 -->
        <template v-if="type === 'pie'">
          <el-form-item label="半径">
            <el-slider
              v-model="config.radius"
              :min="0"
              :max="100"
              :format-tooltip="value => `${value}%`"
            />
          </el-form-item>

          <el-form-item label="玫瑰图">
            <el-switch v-model="config.roseType" />
          </el-form-item>
        </template>

        <template v-else-if="type === 'bar'">
          <el-form-item label="方向">
            <el-radio-group v-model="config.direction">
              <el-radio-button label="vertical">垂直</el-radio-button>
              <el-radio-button label="horizontal">水平</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="堆叠">
            <el-switch v-model="config.stack" />
          </el-form-item>
        </template>

        <template v-else-if="type === 'line'">
          <el-form-item label="平滑">
            <el-switch v-model="config.smooth" />
          </el-form-item>

          <el-form-item label="面积">
            <el-switch v-model="config.area" />
          </el-form-item>
        </template>

        <!-- 颜色配置 -->
        <el-form-item label="配色方案">
          <el-select v-model="config.colorScheme" placeholder="选择配色">
            <el-option label="默认" value="default" />
            <el-option label="暖色" value="warm" />
            <el-option label="冷色" value="cold" />
            <el-option label="自然" value="nature" />
          </el-select>
        </el-form-item>

        <!-- 标签配置 -->
        <el-form-item label="标签显示">
          <el-checkbox-group v-model="config.labels">
            <el-checkbox label="name">名称</el-checkbox>
            <el-checkbox label="value">数值</el-checkbox>
            <el-checkbox label="percent">百分比</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 图例配置 -->
        <el-form-item label="图例位置">
          <el-select v-model="config.legendPosition" placeholder="选择位置">
            <el-option label="顶部" value="top" />
            <el-option label="底部" value="bottom" />
            <el-option label="左侧" value="left" />
            <el-option label="右侧" value="right" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确认</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits } from 'vue'

interface ChartConfig {
  theme: string
  animation: boolean
  radius?: number
  roseType?: boolean
  direction?: 'vertical' | 'horizontal'
  stack?: boolean
  smooth?: boolean
  area?: boolean
  colorScheme: string
  labels: string[]
  legendPosition: string
}

const props = defineProps<{
  type: 'pie' | 'bar' | 'line'
  title?: string
  initialConfig?: Partial<ChartConfig>
}>()

const emit = defineEmits<{
  (e: 'update', config: ChartConfig): void
}>()

const visible = ref(false)
const config = ref<ChartConfig>({
  theme: 'default',
  animation: true,
  colorScheme: 'default',
  labels: ['name', 'value'],
  legendPosition: 'right',
  ...props.initialConfig
})

const title = computed(() => props.title || '图表配置')

const handleConfirm = () => {
  emit('update', config.value)
  visible.value = false
}

// 暴露方法给父组件
defineExpose({
  show: () => {
    visible.value = true
  }
})
</script>

<style lang="scss" scoped>
.chart-config {
  .dialog-footer {
    padding: 20px 0;
    text-align: right;
  }
}
</style> 