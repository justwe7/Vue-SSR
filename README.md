# 基于 webpack5 + vue2 + koa2 搭建的 SSR 项目

### Development

#### Compiles frontend and hot-reloads for development
```sh
npm run dev
```

### Production

#### Compiles frontend and minifies for production
```sh
npm run build
```

#### Run for production

```sh
npm start
```

### Todo
- [x] 启用服务端渲染缓存(需区分场景
- [x] devServer.proxy
- [x] 项目规范(eslint/stylelint/prettier/husky/commitlint..
- [x] webpack打包优化(公共资源、cache、dll、多线程..
- [ ] SSG模式支持
- [x] webpack配置项同构(webpack-chain.(尝试后个人感觉增加了成本，所见非所得)
- [x] keep-alive浏览器历史后退也会触发asyncData钩子执行
- [x] asyncData 执行报错自动触发降级渲染?
- [x] 浏览器控制台及遮罩未展示eslint错误。经排查，因webpack-hot-middleware未完美支持webpack5。发现其实有[分支兼容](https://github.com/webpack-contrib/webpack-hot-middleware/tree/webpack5)了webpack5，指定包分支名 `npm install webpack-contrib/webpack-hot-middleware#webpack5 -D`
