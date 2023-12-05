<template>
  <!-- 系统设置 -->
  <Modal
    v-bind="$attrs"
    :value="value"
    title="系统设置"
    width="600"
    :mask-closable="false"
    @on-cancel="handleBasicSetCancel"
  >
    <Form ref="setForm" :model="formData" :label-width="120">
      <FormItem label="应用目录" prop="appDir">
        <Input
          v-model="formData.appDir"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 5 }"
          style="margin-bottom: 10px; word-break: break-all"
        ></Input>
        <Button @click="handleOpenAppDir">打开目录</Button>
      </FormItem>
      <FormItem label="是否开机启动" prop="autoStart">
        <i-switch v-model="formData.autoStart" size="large" @on-change="handleSwitchAutoStart">
          <span slot="open">ON</span>
          <span slot="close">OFF</span>
        </i-switch>
      </FormItem>
    </Form>
    <div slot="footer"></div>
  </Modal>
</template>

<script>
  const path = window.require('path')

  export default {
    name: 'SetSysModal',
    props: {
      value: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        formData: {
          appDir: '',
          autoStart: false,
        },
      }
    },
    watch: {
      value: {
        handler: function (newVal) {
          newVal && this.getAppInfo()
        },
      },
    },
    methods: {
      handleBasicSetCancel() {
        this.$emit('input', false)
      },
      handleSwitchAutoStart(flag) {
        console.log(flag)
        const { app } = window.require('@electron/remote')
        app.setLoginItemSettings({
          openAtLogin: flag,
        })
      },
      // 打开目录
      handleOpenAppDir() {
        const { shell } = window.require('@electron/remote')
        console.log('homeDir12-->', this.formData.appDir)

        this.formData.appDir && shell.openPath(this.formData.appDir)
      },
      getAppInfo() {
        const { app } = window.require('@electron/remote')
        const path = window.require('path')

        // 获取安装目录（也就是文件安装目录中exe文件的目录）
        const homeDir = path.dirname(app.getPath('exe'))
        this.formData.appDir = homeDir
      },
    },
  }
</script>
