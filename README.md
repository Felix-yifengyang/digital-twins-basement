# Industrial Twin Basement

工业数字孪生前端底座，基于 React 19、TypeScript、Vite、Three.js、React Three Fiber 和 Drei。

支持场景切换、模型缓存与释放、自动取景、选中高亮、HTML 标签，以及 Leva 调参和信息面板。可选功能由应用层组合，模型加载不依赖它们。

## 启动

```sh
pnpm install
pnpm dev
```

## 接入自己的场景

1. 将 GLB 放进 `public/models/`。
2. 在 `src/project/scenes.ts` 配置场景名称和 `modelPath`，例如 `models/workshop.glb`。
3. 参考 `src/project/scene.ts` 配置背景、灯光和视角；不填则使用默认值。

相机 `position` 和 `target` 都填写时使用保存视角，否则自动取景。单场景自动隐藏切换框；切换失败保留旧场景并提供重试。

### 环境配置

根目录 `.env`：

| 配置 | 用途 |
| --- | --- |
| `BASE_URL=./` | 部署基础路径，也可设为 `/` 或 `/demo/` |
| `TUNER=true` | 开启场景调参，交付时可设为 `false` |

修改后需重启开发服务或重新构建。`TUNER` 仅控制调参，不关闭对象信息和性能面板。

调整视角、灯光后，点击面板中的“复制配置”，手动保存到对应场景配置。临时调整不会自动保存。

## 代码在哪

```text
src/
  app/App.tsx        应用装配，可选功能在这里接入或移除
  project/           项目场景与业务配置
  twin/
    SceneCanvas.tsx  三维场景入口
    scene/           配置解析、取景、场景切换
    model/           模型加载、缓存、资源释放
    selection/       点击选择与材质高亮
    label/           Drei Html 标签薄封装
    panel/           Leva 调参、对象信息、性能信息
public/models/       GLB 模型
```

- 选择：`ModelSelection` 默认选中 Mesh，可通过 `resolve` 映射设备父节点，通过 `onSelect` 接入业务。
- 标签：`Label` 接收 `position`、`children`、`className` 和可选 `occlude`；默认不拦截鼠标，不包含避让和距离显隐。
- 面板：对象信息在高亮前提取；性能信息每 500ms 更新。两者均可从 App 独立移除。

## 使用边界

- 支持glb/gltf。
- 默认缓存当前模型和一个历史模型，按条目数限制，不是显存预算；淘汰和卸载时释放资源。
- 高亮面向普通 Mesh 常见材质，不支持自定义 Shader 或 InstancedMesh 单实例高亮。
- 模型节点与业务设备的对应关系由项目提供，不使用运行时 UUID 作为业务 ID。
- Leva 面板样式依赖 0.10 版内部结构，升级时需验收；构建目前仍有大 chunk 警告。
