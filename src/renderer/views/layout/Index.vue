<template>
  <div class="layout">
    <APPHeader />
    <Layout>
      <Sider ref="side1" hide-trigger collapsible :collapsed-width="78" v-model="isCollapsed">
        <Menu
          :active-name="activeMenu"
          theme="dark"
          width="auto"
          :class="menuitemClasses"
          @on-select="handleMenuSelect"
        >
          <MenuItem :name="item.id" v-for="(item, index) of menuList" :key="index">
            <Icon type="ios-navigate"></Icon>
            <span>{{ item.name }}</span>
          </MenuItem>
        </Menu>
      </Sider>
      <Layout>
        <Header :style="{ padding: 0 }" class="layout-header-bar">
          <Icon
            @click.native="collapsedSider"
            :class="rotateIcon"
            :style="{ margin: '0 20px' }"
            type="md-menu"
            size="24"
          ></Icon>
        </Header>
        <Content
          :style="{
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
          }"
        >
          <div class="content-inner-wrap">
            <router-view />
          </div>
        </Content>
      </Layout>
    </Layout>
  </div>
</template>

<script>
  import APPHeader from './APPHeader.vue'
  export default {
    name: 'LayoutIndex',
    components: {
      APPHeader,
    },
    data() {
      return {
        isCollapsed: false,
        activeMenu: '1',
        menuList: [
          {
            name: '文件拷贝',
            id: '1',
            path: '/tool/fileCopy',
          },
          {
            name: '应用信息',
            id: '2',
            path: '/tool/appInfo',
          },
          {
            name: 'README',
            id: '3',
            path: '/tool/readme',
          },
        ],
      }
    },
    computed: {
      rotateIcon() {
        return ['menu-icon', this.isCollapsed ? 'rotate-icon' : '']
      },
      menuitemClasses() {
        return ['menu-item', this.isCollapsed ? 'collapsed-menu' : '']
      },
    },
    methods: {
      collapsedSider() {
        this.$refs.side1.toggleCollapse()
      },
      handleMenuSelect(id) {
        const path = this.menuList.find((item) => item.id == id)['path']
        this.$router.push({ path })
      },
    },
  }
</script>

<style lang="scss" scoped>
  .layout {
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;
  }
  .layout-header-bar {
    background: #fff;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  }
  .layout-logo-left {
    width: 90%;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    margin: 15px auto;
  }
  .menu-icon {
    transition: all 0.3s;
  }
  .rotate-icon {
    transform: rotate(-90deg);
  }
  .menu-item span {
    display: inline-block;
    overflow: hidden;
    width: 69px;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    transition: width 0.2s ease 0.2s;
  }
  .menu-item i {
    transform: translateX(0px);
    transition: font-size 0.2s ease, transform 0.2s ease;
    vertical-align: middle;
    font-size: 16px;
  }
  .collapsed-menu span {
    width: 0px;
    transition: width 0.2s ease;
  }
  .collapsed-menu i {
    transform: translateX(5px);
    transition: font-size 0.2s ease 0.2s, transform 0.2s ease 0.2s;
    vertical-align: middle;
    font-size: 22px;
  }
  .content-inner-wrap {
    margin: 10px;
    background: #fff;
  }
</style>
