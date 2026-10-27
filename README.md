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

## 开发调参

根目录 `.env` 统一管理全局配置：`BASE_URL` 指定部署资源基础路径，`TUNER` 控制调参面板。`TUNER=true` 时，右上角会出现 Leva 面板，可实时调整背景、灯光强度、颜色、位置和相机视野。黄色辅助线显示主光方向，可在面板中关闭。

1. 用鼠标调整到满意的视角。
2. 调整灯光等参数后，点击“复制配置（含当前视角）”，自动捕获当前相机位置和观察目标。
3. 将复制内容替换到 `src/project/scene.ts`，保存为默认参数。

面板修改仅在当前开发会话中生效；刷新前需要复制并保存配置。交付前将 `.env` 中的 `TUNER` 设置为 `false`，再运行 `pnpm build`，构建会排除调参组件和 Leva。开关对开发和正式构建同样生效；修改后需重启开发服务或重新构建。关闭面板后，场景读取保存的配置。

## 模型切换与资源

`SceneCanvas` 接收可选的 `modelUrl`，不传时加载 `scene.ts` 中的默认模型。项目切换厂房或生产线时，只更新地址，Canvas 保持挂载：

```tsx
<SceneCanvas modelUrl={`${import.meta.env.BASE_URL}models/workshop.glb`} />
```

`Model` 独立管理加载和资源生命周期，不使用 `useGLTF` 全局缓存：

- 新模型加载期间保留旧模型；失败显示重试按钮。
- 默认保留当前模型和一个最近模型；淘汰时释放几何体、材质、纹理、骨骼及 ImageBitmap。
- 快速切换产生的过期结果不会显示，无人使用时释放。
- 整个模型组件卸载后释放该组件拥有的缓存；卸载后完成的请求也会清理。
- 当前支持普通 GLB、Draco 和 Meshopt。Draco 默认使用在线解码器，离线部署需在 `modelResources.ts` 改为本地解码器地址。

缓存按模型数量限制，并非显存字节预算。切换瞬间可能同时占用当前模型、最近模型和正在加载的新模型；客户大模型需根据实测降低 `Model` 的 `maxIdle`（设为 0 不保留历史模型）。该参数在组件创建时确定。模型资源归此加载模块所有，不要将材质或纹理借给外部长期使用。

## 设备选中

`ModelSelection` 是独立的可选组件，由 `App` 通过 `SceneCanvas.renderModel` 接入。移除该属性和导入后，模型仍正常显示，加载器和缓存无需修改。

默认点击选中 GLB 的网格零件并以橙色高亮，点击画布空白取消；模型替换或模块卸载时恢复材质。拖动超过点击阈值不触发选中。示例 GLB 没有设备层级，默认不能自动将多个零件识别为一台设备。

项目可传入 `resolve(clicked)` 返回需要选中的设备父节点，返回 `null` 表示不可选；通过稳定的 `onSelect(object)` 回调读取节点名称、`userData` 等进行业务映射，取消或卸载返回 `null`。不要把跨模型 UUID 当成稳定的业务设备 ID。

高亮仅克隆材质，复用原有纹理、几何体；取消时恢复原材质并释放克隆，不修改加载缓存。当前面向普通 Mesh 材质；自定义着色器及 InstancedMesh 单实例高亮不在本轮支持范围内。

```powershell
node tests/modelSelection.test.mjs
```

## 点击信息查看

`App` 使用 `ModelSelection.onSelect` 获取选中对象，通过 `getModelInfo` 读取点击时的原始信息，并交给独立的 `ModelInfo` 组件在 Leva 面板展示。取消选择或模型替换后清空信息。

只读信息包含对象名称、类型、运行时 UUID、父级路径、子节点数、可见性、局部变换、世界位置，以及网格的顶点/三角形数量、材质槽属性。变换为点击时的快照；三角形数按普通 Mesh 的完整几何体统计，不代表实时实际绘制数量。面板不支持编辑。

信息组件不依赖 SceneControls，关闭 TUNER 后仍可使用；移除 App 中的信息状态、回调和 LevaPanel 接入即可取消信息查看，不影响模型与高亮。UUID 仅用于运行时排查，不能作为持久设备 ID。

```powershell
node tests/modelInfo.test.mjs
```

## Leva 工具模块

所有 Leva 界面集中在 src/twin/leva/：LevaPanel 管理面板，ModelInfoControls 显示只读模型信息，SceneControls 连接场景调参，getSceneControls 定义灯光、背景和相机的控制项。twin/leva/getModelInfo 只提取对象信息，不依赖 Leva。应用层负责接入，三维核心不导入 Leva 模块。
