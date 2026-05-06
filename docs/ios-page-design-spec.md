# iOS 页面设计总文档

## 1. 文档说明

本文档用于统一整理 `PolishedJapaneseTraining` iOS App 的全部页面设计信息，包括：

- 页面信息架构
- 导航关系
- 已实现页面的 UI 与功能定义
- 规划中页面的 UI 与功能定义
- onboarding、登录、游客模式、设置、用户页等新增设计

本文档整合并吸收了以下文档中的页面信息：

- `docs/ios-navigation-flow.md`
- `docs/ios-onboarding-settings-spec.md`

后续若涉及 iOS 页面新增、删改、入口调整、页面功能变更，应优先更新本文档。

## 2. 产品定位

`PolishedJapaneseTraining` 是一个帮助用户练习“日语说明能力”的 iOS App。

核心体验目标：

- 让用户选择一个说明主题
- 使用一个说明模型组织表达
- 录音输出自己的日语说明
- 获得 AI 反馈
- 保存值得复习的反馈到 Learned Box

## 3. 设计原则

### 3.1 视觉方向

- 白底为主，搭配柔和高亮色块
- 大圆角卡片
- 绿色、蓝色、橙色为主要功能色
- 情绪友好、鼓励式文案
- 每页重点 CTA 明确

### 3.2 页面原则

- 一页只服务一个主要任务
- 首页负责开始练习与回到练习
- 录音、反馈、复练形成主链路
- 设置页承载偏好、帮助、隐私
- 用户页承载账号资料与绑定安全

### 3.3 身份模式原则

App 支持两种身份：

- 登录用户
- 游客用户

规则如下：

- 登录用户可使用完整用户功能
- 游客用户可体验主练习链路
- 游客用户遇到账户型功能时必须先登录

特别规定：

- 游客点击“保存到 Learned Box”
- 游客执行“将反馈保存到 box”类同义动作
- 游客打开 Learned Box

以上场景必须立即触发登录拦截，不允许静默失败，不允许先本地保存后补登录。

## 4. 页面总表

| 分组 | 页面 | SwiftUI 文件 | 状态 | 说明 |
| --- | --- | --- | --- | --- |
| 主流程 | Home | `HomeScreen.swift` | 已实现 | 首页，推荐、继续练习、快捷入口 |
| 主流程 | Topic Selection | `TopicSelectionScreen.swift` | 已实现 | 主题选择页 |
| 主流程 | Topic Detail | `TopicDetailScreen.swift` | 已实现 | 主题详情与开始录音前确认 |
| 主流程 | Model List | `ModelListScreen.swift` | 已实现 | 说明模型列表 |
| 主流程 | Model Intro | `ModelIntroScreen.swift` | 已实现 | 模型详细介绍 |
| 主流程 | Recording | `RecordingScreen.swift` | 已实现 | 录音、转写、生成反馈 |
| 主流程 | Feedback | `FeedbackScreen.swift` | 已实现 | AI 反馈结果页 |
| 主流程 | Retry | `RetryScreen.swift` | 已实现 | 根据反馈进行再次挑战前的提示页 |
| 主流程 | Learned Box | `LearnedBoxScreen.swift` | 已实现 | 已保存学习记录页 |
| onboarding | Onboarding 0 Hello | `OnboardingHelloScreen.swift` | 规划中 | 情绪欢迎页 |
| onboarding | Onboarding 1 Welcome | `OnboardingWelcomeScreen.swift` | 规划中 | 产品价值页 |
| onboarding | Onboarding 2 How It Works | `OnboardingHowItWorksScreen.swift` | 规划中 | 使用方式页 |
| onboarding | Onboarding 3 Permission | `OnboardingPermissionScreen.swift` | 规划中 | 麦克风权限说明页 |
| onboarding | Onboarding 4 Login | `OnboardingLoginScreen.swift` | 规划中 | 登录 / 游客模式选择页 |
| 账号体系 | Login Required | `LoginRequiredSheet.swift` 或 `LoginRequiredScreen.swift` | 已实现 | 游客触发受限功能时拦截 |
| 账号体系 | Settings | `SettingsScreen.swift` | 已实现 | 偏好、帮助、隐私设置页 |
| 账号体系 | User Profile | `UserProfileScreen.swift` | 规划中 | 用户资料、绑定邮箱、登出等 |
| 账号体系 | First Login Survey | 待定 | 规划中 | 首次登录后的学习目标/水平问卷 |

## 5. 导航关系

### 5.1 当前主导航

```text
Home
├─ Topic Selection
│  └─ Topic Detail
│     ├─ Model Intro
│     └─ Recording
│        └─ Feedback
│           ├─ Retry
│           │  └─ Recording
│           └─ Save to Learned Box
├─ Model List
│  ├─ Model Intro
│  └─ Topic Detail
└─ Learned Box
   └─ Feedback
```

### 5.2 目标导航

```text
首次启动
App Launch
└─ Onboarding 0
   └─ Onboarding 1
      └─ Onboarding 2
         └─ Onboarding 3
            └─ Onboarding 4 Login
               ├─ 登录成功 -> 首次登录问卷 -> Home
               └─ 游客模式 -> Home

常规使用
Home
├─ Topic Selection
├─ Model List
├─ Learned Box
├─ Settings
│  └─ User Profile
└─ 受限功能触发
   └─ Login Required
      └─ Login
```

## 6. 页面设计明细

## 6.1 Home

文件：
`apps/ios/PolishedJapaneseTraining/Views/HomeScreen.swift`

### 页面目标

- 让用户快速开始一轮练习
- 展示推荐主题与继续练习入口
- 提供进入其他核心模块的入口

### 主要 UI 结构

- 顶部 Header
  - 问候文案
  - Learned Box 入口
  - Settings 入口
- 连续学习卡片
- 今日推荐卡片
- 继续练习卡片
- 强化点标签区
- 快捷功能区

### 当前核心功能

- 加载 Home API
- 展示推荐主题
- 展示 continue 主题和进度
- 展示 unread Learned Box badge
- 跳转主题选择页
- 跳转模型列表页
- 跳转 Learned Box
- 跳转 Settings

### 建议新增功能

- 游客模式下进入 Learned Box 时触发登录拦截

## 6.2 Topic Selection

文件：
`apps/ios/PolishedJapaneseTraining/Views/TopicSelectionScreen.swift`

### 页面目标

- 让用户按等级和分类挑选练习主题

### 主要 UI 结构

- 顶部 Header
- 等级筛选按钮
- 分类筛选按钮
- 主题列表卡片
- 底部 CTA：开始当前主题练习

### 页面功能

- 调用 Theme API 获取主题列表
- 支持 level/category 筛选
- 选择主题后写入 `AppState.selectedTopic`
- 跳转 Topic Detail

## 6.3 Topic Detail

文件：
`apps/ios/PolishedJapaneseTraining/Views/TopicDetailScreen.swift`

### 页面目标

- 在正式录音前帮助用户理解当前题目和推荐话术结构

### 主要 UI 结构

- 顶部主题信息
- 说明目标卡片
- 推荐模型卡片
- 关键词区
- 役立つ表現区
- 提示区
- CTA：开始录音

### 页面功能

- 调用 Theme Detail API
- 读取推荐说明模型
- 支持跳转 Model List / Model Intro
- 创建 session 并进入 Recording

## 6.4 Model List

文件：
`apps/ios/PolishedJapaneseTraining/Views/ModelListScreen.swift`

### 页面目标

- 帮助用户选择合适的说明模型

### 主要 UI 结构

- 顶部 Header
- 模型说明引导文案
- 模型卡片列表
  - 模型名
  - 适用场景
  - 描述
  - 结构 steps
  - 特点
  - 适合的说明类型
- CTA：使用该模型

### 页面功能

- 调用 Model API 加载模型列表
- 选择模型写入 `selectedModel`
- 进入 Topic Detail 或继续当前流程
- 可进入 Model Intro

## 6.5 Model Intro

文件：
`apps/ios/PolishedJapaneseTraining/Views/ModelIntroScreen.swift`

### 页面目标

- 详细解释单个说明模型怎么用

### 主要 UI 结构

- 模型标题与介绍
- 公式说明
- 步骤拆解
- 常用表达
- 使用技巧
- 最终表达图景
- 返回按钮

### 页面功能

- 加载单个模型介绍内容
- 帮助用户在录音前理解模型结构

## 6.6 Recording

文件：
`apps/ios/PolishedJapaneseTraining/Views/RecordingScreen.swift`

### 页面目标

- 完成录音
- 展示转写状态
- 进入 AI 反馈

### 主要 UI 结构

- 当前主题和模型信息
- 录音状态区
- 时长显示
- 开始/停止录音按钮
- 音声认知结果区
- 生成反馈按钮
- 再次录音按钮
- 录音小贴士

### 页面功能

- 使用 `AVAudioRecorder` 录音
- 上传音频
- 请求转写
- 展示 transcript
- 生成反馈并跳转 Feedback

### 状态说明

- 未录音
- 录音中
- 录音完成
- 转写中
- 可生成反馈
- 生成反馈失败

## 6.7 Feedback

文件：
`apps/ios/PolishedJapaneseTraining/Views/FeedbackScreen.swift`

### 页面目标

- 展示 AI 对本次说明的综合反馈
- 引导用户保存或再次挑战

### 主要 UI 结构

- 顶部 Header
- 总分卡片
- 总体评价说明
- 做得好的点
- 改进点 Top 3
- 原始转写文本
- 优化示例表达
- 模型复习入口
- 底部 CTA 区

### 页面功能

- 展示评分、原因、优点、改进点
- 从 Recording 来源进入时可保存到 Learned Box
- 从 Learned Box 来源进入时保存按钮为已保存状态
- 支持跳转 Retry
- 支持回 Home
- 支持查看当前说明模型

### 游客模式规则

- 游客点击“保存到 Learned Box”时，必须立即触发登录拦截
- 游客点击“将反馈保存到 box”类动作时，必须立即触发登录拦截
- 不允许直接保存成功

## 6.8 Retry

文件：
`apps/ios/PolishedJapaneseTraining/Views/RetryScreen.swift`

### 页面目标

- 在用户再次录音前，用鼓励和结构化提示帮助其聚焦改进

### 主要 UI 结构

- 鼓励卡片
- 本次改善重点
- 前次回答回顾
- 模型参考入口
- 快速技巧卡片
- 底部按钮：再次录音

### 页面功能

- 根据最新反馈提取重点
- 引导回到 Recording 再练一次

## 6.9 Learned Box

文件：
`apps/ios/PolishedJapaneseTraining/Views/LearnedBoxScreen.swift`

### 页面目标

- 展示用户保存过的练习记录
- 让用户回顾成长轨迹

### 主要 UI 结构

- 顶部 Header
- 数据概览卡片
- 已保存记录列表
  - 模型名
  - 分数
  - 主题标题
  - 保存日期
  - NEW 标记
- 查看详情入口

### 页面功能

- 加载 Learned Cards API
- 打开单条记录并进入 Feedback 详情
- 已读后清理 unread badge

### 游客模式规则

- 游客无权进入 Learned Box
- 游客点击首页或其他入口进入 Learned Box 时，必须先显示登录拦截

## 7. onboarding 页面设计

## 7.1 Onboarding 0 Hello

建议文件：
`apps/ios/PolishedJapaneseTraining/Views/OnboardingHelloScreen.swift`

### 页面目标

- 建立第一眼好感
- 用可爱、轻松的欢迎氛围降低新用户心理门槛

### 页面内容

- 柔和背景
- 可爱插画或拟物元素
- 简单问候文案
- 简短欢迎语
- 主按钮：`开始看看`

### 页面特点

- 只负责情绪开场
- 不承担功能解释

## 7.2 Onboarding 1 Welcome

建议文件：
`apps/ios/PolishedJapaneseTraining/Views/OnboardingWelcomeScreen.swift`

### 页面目标

- 快速解释产品价值

### 页面内容

- 主标题
- 副标题
- 三个价值点卡片
- 主按钮：`继续`
- 次按钮：`跳过`

## 7.3 Onboarding 2 How It Works

建议文件：
`apps/ios/PolishedJapaneseTraining/Views/OnboardingHowItWorksScreen.swift`

### 页面目标

- 用最短路径说明使用流程

### 页面内容

- 3 步流程卡片
  - 选择主题
  - 录音表达
  - 获得 AI 反馈
- Learned Box 的登录价值提示

## 7.4 Onboarding 3 Permission

建议文件：
`apps/ios/PolishedJapaneseTraining/Views/OnboardingPermissionScreen.swift`

### 页面目标

- 在真正弹系统权限前解释录音用途

### 页面内容

- 权限说明卡片
- 授权状态说明
- 主按钮：`允许并继续`
- 次按钮：`稍后再说`

### 页面规则

- 无论授权与否，下一步都进入登录页

## 7.5 Onboarding 4 Login

建议文件：
`apps/ios/PolishedJapaneseTraining/Views/OnboardingLoginScreen.swift`

### 页面目标

- 让用户在首次进入时做身份选择

### 页面内容

- 登录价值说明
- 权益卡片
- 主按钮：`登录 / 注册`
- 灰色 URL 风格游客入口：
  `暂时不登录，先以游客模式体验`

### 页面规则

- 登录成功后进入首次登录问卷或首页
- 选择游客模式则直接进入首页

## 8. 登录拦截页设计

建议文件：
`apps/ios/PolishedJapaneseTraining/Views/LoginRequiredSheet.swift`

### 页面目标

- 在游客触发受限功能时承接登录

### 必须触发的场景

- 保存到 Learned Box
- 将反馈保存到 box
- 打开 Learned Box
- 删除我的数据

### 结构建议

- 标题：`登录后即可使用此功能`
- 动态说明文案
- 主按钮：`登录后继续`
- 次按钮：`取消`
- 辅助链接：`继续游客体验`

### 状态续接

应记录 `pendingProtectedAction`，登录成功后自动继续原操作：

- `saveToLearnedBox`
- `openLearnedBox`
- `deleteMyData`

## 9. Settings 页面设计

建议文件：
`apps/ios/PolishedJapaneseTraining/Views/SettingsScreen.swift`

### 页面目标

- 提供偏好、帮助、隐私相关设置入口

### 页面结构

1. 账号入口
2. 练习偏好
3. 提醒与通知
4. 帮助与说明
5. 隐私与数据

### Section A：账号入口

登录用户：

- 展示头像、昵称、账号标识、登录状态
- 点击进入 User Profile

游客用户：

- 展示游客模式说明
- 点击 `立即登录`

### Section B：练习偏好

- 自动保存优秀反馈到 Learned Box

规则：

- 若该能力依赖账号，游客应展示禁用态或引导登录

### Section C：提醒与通知

- 每日练习提醒
- 提醒时间

### Section D：帮助与说明

- 查看新手介绍
- 如何使用 Learned Box
- 反馈如何生成

### Section E：隐私与数据

- 麦克风权限状态
- 隐私说明
- 删除我的数据
- 当前版本

### 特别规则

- 游客可以进入 Settings
- 游客点击删除我的数据时，必须先登录拦截

## 10. User Profile 页面设计

建议文件：
`apps/ios/PolishedJapaneseTraining/Views/UserProfileScreen.swift`

### 页面目标

- 承载账号资料、绑定关系与登出能力

### 页面结构

1. 用户头部信息
2. 个人资料
3. 账号绑定与安全
4. 学习账号权益说明
5. 退出登录

### Section 1：用户头部信息

- 头像
- 昵称
- 账号标识
- 登录状态

### Section 2：个人资料

- 编辑用户信息
- 修改昵称
- 修改头像

### Section 3：账号绑定与安全

- 绑定邮箱
- 更换绑定邮箱
- 邮箱验证状态
- 修改密码（预留）

邮箱状态建议：

- 未绑定邮箱
- 已绑定邮箱
- 已验证 / 未验证

### Section 4：学习账号权益说明

- 保存反馈到 Learned Box
- 查看个人练习历史
- 后续多设备同步能力

### Section 5：退出登录

- 单独 section
- 点击后弹二次确认
- 文案需明确：
  `退出后，你将回到游客模式，但不会删除已保存的账号数据`

### 页面规则

- 仅登录用户可进入完整用户页
- 游客从设置页账号入口点击时，应转登录

## 11. 首次登录问卷页

建议页面：
可作为登录成功后的单页问卷或轻量 flow

### 页面目标

- 补充用户学习画像
- 为首页推荐和个性化练习提供基础信息

### 采集字段

- 当前日语水平：初级 / 中级 / 高级
- 学习目标：日常交流 / 面试表达 / 留学沟通 / 工作汇报 / 其他

### 产品规则

- 可跳过
- 问题控制在 2 到 3 个
- 不放入用户页日常资料中

## 12. 状态与本地存储

建议本地状态：

- `hasCompletedOnboarding`
- `isLoggedIn`
- `isGuestMode`
- `hasSeenMicrophonePermissionIntro`
- `preferredDailyReminderEnabled`
- `preferredReminderTime`
- `autoSaveToLearnedBox`
- `pendingProtectedAction`

建议数据来源：

- `AppState` 管理主业务导航和练习态
- `@AppStorage` / `UserDefaults` 管理 onboarding 与用户偏好
- 后续登录态应有单独的 `AppEntryState` 或 `SessionState`

## 13. 当前实现与规划差异

当前已实现：

- Home
- Topic Selection
- Topic Detail
- Model List
- Model Intro
- Recording
- Feedback
- Retry
- Learned Box

当前尚未实现：

- 第 0 到 4 页 onboarding
- 登录 / 游客模式切换
- 登录拦截页
- Settings
- User Profile
- 首次登录问卷

当前 `RootView` 路由尚未包含：

- Settings
- User Profile
- Login
- Onboarding flow

## 14. 开发落地建议

建议新增或调整：

- 新建 onboarding 页面文件
- 新建 `SettingsScreen.swift`
- 新建 `UserProfileScreen.swift`
- 新建 `LoginRequiredSheet.swift`
- 为 `AppRoute` 增加 `.settings`、`.userProfile`、`.login`
- 在 `RootView` 增加 onboarding / 登录态入口判断
- 在 `FeedbackScreen` 和 Learned Box 入口加入游客拦截

## 15. 维护建议

- 所有 iOS 页面设计变更优先更新本文档
- 旧文档可保留作为历史记录，但不再作为页面设计主文档
- 若未来增加 Web 端同构页面，可基于本文档继续拆分平台差异
