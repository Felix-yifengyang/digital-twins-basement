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

`SceneCanvas` 接收场景 `config`，项目切换厂房或生产线时更新配置，Canvas 保持挂载：

```tsx
<SceneCanvas config={{ modelPath: 'models/workshop.glb' }} />
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

## 首次取景与配置模板

`project/scene.ts` 使用 `undefined` 标明可选项并提供示例。底座在 `twin/sceneSettings.ts` 集中合并默认值，灯光强度为 0 时不会被默认值覆盖。

没有完整的 `camera.position` 和 `camera.target` 时，GLB 加载完成后通过 Drei Bounds 自动取景，不改变模型坐标或缩放。完整填写两项后使用保存视角；只填写一项会警告并自动取景。FOV、背景和灯光可以分别覆盖。Bounds 根据模型范围调整裁剪面。

Leva 使用合并后的参数初始化；复制配置读取实际相机位置和观察目标，输出 camera.position、camera.target。将结果替换 scene.ts 的 sceneConfig 声明即可，保留顶部 SceneConfig 类型定义。没有自动写入源码文件。

各场景使用自己的保存视角，没有完整视角则自动取景。普通参数更新不会反复重置视角。

## 多场景切换

在 `project/scenes.ts` 中维护场景列表，每项包含唯一 id、显示名称和 config。默认条目复用 `scene.ts` 模板；增加厂房或生产线时增加条目并填写对应 GLB 路径即可。列表包含泵站与方块示例，可直接验证两个不同 GLB 的切换。

App 左上角下拉框选择场景。SceneCanvas 接收 config，复用同一个 Canvas 和模型缓存。新模型就绪后才应用对应灯光、背景、视角和 Leva 参数；失败保留旧场景并可重试。切换到新的显示内容时清除选中信息。每个场景填写完整视角则恢复，否则 Bounds 自动取景。

Leva 的复制配置导出当前已显示场景，保存到列表中对应的 config。切换不会自动保存临时调参；需要保留时请先复制。场景下拉框是应用层入口，可替换为客户导航或路由。

Model 负责同一加载器内的有限缓存和资源释放。

方块模型来源：[Khronos glTF Sample Assets / Box](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Box)，文件为 public/models/box.glb。

鸭子模型来源：[Khronos glTF Sample Assets / Duck](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Duck)，文件为 public/models/duck.glb。可按泵站 → 方块 → 鸭子的顺序切换，触发默认历史缓存淘汰。

## 性能信息

Leva 的性能信息分组每 500ms 读取 renderer.info，显示几何体、纹理、着色器程序数量，以及最近一帧的绘制调用和三角形数；这些是数量，不是显存字节数。模型缓存列出加载中、使用中和历史缓存条目。泵站 → 方块 → 鸭子切换后，泵站应退出缓存；多次循环后计数应趋于稳定，不要求归零。PerformanceInfoControls 可从 App 独立移除，资源管理不依赖它。

场景切换入口由 twin/SceneSwitcher.tsx 独立封装，状态、下拉框和样式均由它管理。App 仅传入 scenes 并通过回调获得当前 config；只有一个条目时自动隐藏下拉框。取消切换时可直接向 SceneCanvas 传固定配置，无需修改模型加载或资源管理。
