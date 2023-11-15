<template>
  <!-- 配置copy目录 -->
  <Modal
    v-bind="$attrs"
    title="目录配置"
    :loading="showLoading"
    :mask-closable="false"
    @on-ok="handleBasicSetSure"
    @on-cancel="handleBasicSetCancel"
  >
    <Form ref="setForm" :model="formData" :label-width="120" :rules="formRule">
      <FormItem label="本地根目录" prop="localDir">
        <Input v-model="formData.localDir"></Input>
      </FormItem>
      <FormItem label="广东根目录" prop="gdDir">
        <Input v-model="formData.gdDir"></Input>
      </FormItem>
      <FormItem label="河南根目录" prop="hnDir">
        <Input v-model="formData.hnDir"></Input>
      </FormItem>
      <FormItem label="是否同步到河南" prop="isSync">
        <i-switch v-model="formData.isSync" size="large">
          <span slot="open">ON</span>
          <span slot="close">OFF</span>
        </i-switch>
      </FormItem>
    </Form>
  </Modal>
</template>

<script>
  export default {
    name: 'BasicSetModal',
    props: {
      config: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        formData: {
          localDir: '',
          gdDir: '',
          hnDir: '',
          isSync: false,
        },
        formRule: {
          localDir: [{ required: true, message: '本地根目录不能为空', trigger: 'blur' }],
          gdDir: [{ required: true, message: '广东根目录不能为空', trigger: 'blur' }],
          hnDir: [{ required: true, message: '河南根目录不能为空', trigger: 'blur' }],
        },
        showLoading: false,
      }
    },
    watch: {
      config: {
        handler: function (newVal) {
          this.formData = newVal
        },
        immediate: true,
      },
    },
    methods: {
      handleBasicSetCancel() {
        this.$emit('input', false)
      },
      handleBasicSetSure() {
        this.showLoading = true
        this.$refs['setForm'].validate((valid) => {
          this.showLoading = false
          if (valid) {
            this.$ipcRenderer.send('main-asynchronous-message', {
              replyCommand: 'setAppCongfig',
              extraData: this.formData,
            })
            this.$Message.success('保存成功')
            this.$emit('on-success')
            this.$emit('input', false)
          }
        })
      },
    },
  }
</script>
