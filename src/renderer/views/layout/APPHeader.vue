<template>
  <div class="app-header-wrap">
    <div class="logo-box no-drag">
      <img class="logo" src="../../../../public/icons/favicon.png" />
    </div>
    <div class="right-area no-drag">
      <ul class="win-operate">
        <li class="item" @click="handleOperate('refresh')"
          ><Icon type="ios-refresh-circle-outline" class="icon"
        /></li>
        <li class="item" @click="handleOperate('set')"
          ><Icon type="ios-cog-outline" class="icon"
        /></li>
        <li class="item" @click="handleOperate('lock')"
          ><Icon type="ios-lock-outline" class="icon"
        /></li>
        <li class="item" @click="handleOperate('mini')"><Icon type="ios-remove" class="icon" /></li>
        <li class="item" @click="handleOperate('maxi')"
          ><Icon :type="isWinMax ? 'ios-browsers-outline' : 'ios-square-outline'" class="icon"
        /></li>
        <li class="item close-btn" @click="handleOperate('close')"
          ><Icon type="ios-close" class="icon"
        /></li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { mapMutations, mapState } from 'vuex'

  export default {
    name: 'APPHeader',
    data() {
      return {
        isWinMax: false, // 是否窗口最大化
      }
    },
    computed: {
      ...mapState(['isAppOnTop']),
    },
    methods: {
      ...mapMutations(['setAppOnTopStatus']),
      handleOperate(opName) {
        const { getCurrentWindow, getCurrentWebContents } = window.require('@electron/remote')
        const mainWin = getCurrentWindow()
        switch (String(opName)) {
          case 'refresh': // 刷新
            getCurrentWebContents().reload()
            break
          case 'set': // 设置
            break
          case 'lock': // 设置置顶
            this.setAppOnTopStatus(!this.isAppOnTop)
            this.$nextTick(() => {
              // 设置置顶
              mainWin.setAlwaysOnTop(this.isAppOnTop)
            })
            break
          case 'mini': // 最小化
            mainWin.minimize()
            break
          case 'maxi': // 最大化
            if (mainWin.isMaximized()) {
              // mainWin.unmaximize() // 向下还原
              mainWin.restore() // 向下还原
            } else {
              mainWin.maximize()
            }
            this.isWinMax = mainWin.isMaximized()
            break
          case 'close': // 关闭
            mainWin.close()
            break
        }
      },
    },
    mounted() {},
  }
</script>

<style lang="scss" scoped>
  .app-header-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    width: 100%;
    padding: 10px 0 10px 10px;
    box-sizing: border-box;
    background-color: #fff;
    -webkit-app-region: drag;
    .logo-box {
      width: 40px;
      .logo {
        width: 100%;
        height: 40px;
      }
    }
    .right-area {
      .win-operate {
        display: flex;
        align-items: center;
        .item {
          margin-right: 10px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          &:last-child {
            margin-right: 0;
          }
          &:hover {
            background-color: #ddd;
          }
          .icon {
            font-size: 24px;
          }
          &.close-btn {
            &:hover {
              background-color: rgb(235, 70, 70);
              .icon {
                color: #fff;
              }
            }
          }
        }
      }
    }
  }
  .no-drag {
    -webkit-app-region: no-drag;
  }
</style>
