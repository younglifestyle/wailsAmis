'use strict';
const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// 统一路径解析
function resolve(dir) {
  return path.resolve(__dirname, dir);
}

// 包括生产和开发的环境配置信息
module.exports = {
  webpack: {
    cache: {
      type: 'filesystem', // 使用文件系统缓存
    },
    // webpack的resolve配置
    resolve: {
      // 用于配置webpack在尝试过程中用到的后缀列表
      extensions: ['.js', '.jsx', '.ts', '.tsx','.esm.js', '.umd.js', '.min.js', '.json', '.mjs'],
      alias: {
        '@': resolve('src'),
        // $function: resolve('src/function'),
        // $utils: resolve('src/utils'),
      },
      // conditionNames: ['require']
    },
    createDeclaration: false, // 打包时是否创建ts声明文件
    ignoreNodeModules: false, // 打包时是否忽略 node_modules
    allowList: [], // ignoreNodeModules为true时生效
    externals: ['react/jsx-runtime'],
    projectDir: ['src'],
    template: resolve('./src/index.html'), // 使用自己的html模板
    // cssLoaderUrl: true,
    // cssLoaderUrlDir: 'editor/fontawesome-free',
    moduleRules: [], // 用于配置自定义loaders
    plugins: [], // 用于配置自定义plugins
  },
  dev: {
    entry: { // 本地调试模式的入口
      index: './src/index.tsx',
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      clean: true,
    },
    // 用于开启本地调试模式的相关配置信息
    NODE_ENV: 'development',
    ignoreNodeModules: false, // 打包时是否忽略 node_modules
    port: 31080,
    autoOpenBrowser: true,
    // assetsPublicPath: '/', // 设置静态资源的引用路径（根域名+路径）
    // assetsSubDirectory: '',
    // hostname: 'localhost',
    cssSourceMap: false,
    closeHotReload: false, // 是否关闭热更新
    closeEditorClient: true, // 是否关闭自动注入editor
    proxyTable: {
      /**
       * 将含有'/apiTest'路径的api代理到'http://api-test.com.cn'上，
       * 详细使用见 https://www.webpackjs.com/configuration/dev-server/#devserver-proxy
       */
      '/apiTest': {
        target: 'http://api-test.com.cn', // 不支持跨域的接口根地址
        ws: true,
        changeOrigin: true,
      },
    }
  },
  build: {
    entry: { // webpack构建入口
      index: './src/index.tsx',
      // editor:  './src/mobile.tsx'
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true, // 启用并行处理
        }),
      ],
    },
    // 用于构建生产环境代码的相关配置信息
    NODE_ENV: 'production',
    output: {
      path: path.resolve(__dirname, './dist'),
      clean: true,
    },
    // assetsRoot: resolve('./demo-6.9.0'), // 打包后的文件绝对路径（物理路径）
    // assetsPublicPath: '/', // 设置静态资源的引用路径（根域名+路径）
    // assetsSubDirectory: '', // 资源引用二级路径
    productionSourceMap: false,
    productionGzip: false,
    productionGzipExtensions: ['js', 'css', 'json'],
    plugins: [new MonacoWebpackPlugin()],
    bundleAnalyzerReport: false,
  }
};
