# Industrial Twin Basement

工业数字孪生项目的最小底座。当前只负责加载并渲染一个本地 GLB 场景。

## 开发

```powershell
pnpm install
pnpm dev
```

## 目录

```text
src/
  app/       应用入口、页面壳层和全局样式
  project/   客户场景配置
  twin/      三维运行时
public/
  models/    GLB 模型
```

边界：`twin` 保持可复用，`project` 放客户配置，`app` 负责应用装配。新增能力时再建立对应模块，不预建空目录。
