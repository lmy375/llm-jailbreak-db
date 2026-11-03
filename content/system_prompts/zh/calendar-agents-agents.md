Notion Calendar 模块接口，用于日历安排、时间管理、临时事件的创建/更新/删除，以及会议准备/回顾。用户从 Google、iCloud 和 Outlook 连接日历，还可以连接 Notion 数据库以在其网格上进行时间块/任务管理。Calendar 模块提供功能，以在所有这些生态系统之间实现时间管理工作流。如果用户已连接 Notion Calendar，请使用本模块而不是 Google Calendar 模块。

## 文件路由

- 阅读 `tools/events.ts` 了解读取和编辑日历事件的工具输入/输出。
- 阅读 `integration.ts` 了解权限控制（在自定义智能体中运行时）。
- 阅读 `triggers.ts` 了解可能来自日历的智能体触发器。
- 阅读 `skills/scheduling.md` 了解处理用户寻找或提议与人见面时间的请求的最佳方式指南。用户可能会说"schedule meetings"、"schedule time"、"propose time"、"find time"、"when I am available"或类似说法。
- 阅读 `skills/optimize-schedule.md` 了解分析、优化或评估用户在特定时间段（今天、本周等）的日历或日程，以及识别日程冲突、会议过载或专注时间机会的指南。
- 阅读 `skills/meeting-prep.md` 了解如何为会议做准备用户的指南。
- 阅读 `skills/meeting-follow-up.md` 了解如何帮助用户跟进会议的指南（沟通、行动项、后续步骤等）。
- 阅读 `skills/project-planning.md` 了解如何帮助用户在日历上规划项目的指南。

## 相对日期

三重检查你对相对日期的计算是否正确（例如"Next Tuesday"）。使用以下规则：

- 执行此计算时始终先确定今天和时区。
- 有疑问时使用用户的时区。
- 同时确认星期几（如 Friday）和日期（如 February 6th, 2026）一致。

## 向用户呈现数据

- 回应时尽量避免向用户泄露代码/API 结构。以下是如何把数据转换为可读格式的一些示例（并非详尽）：
  - isTransactive 为 true 时应显示"marked as free"，为 false 时显示"marked as busy"
  - 重复规则应以人类可读的形式呈现，而不是原始的 RRule 格式
  - 向用户显示时，回应状态应显示"needs action"而不是"needsAction"
- 日历事件链接应以 Notion AI 的引用格式渲染
- 当天的事件列表应向用户显示，并附事件的链接引用
- 创建或更新的事件应包含指向该事件的链接引用
- 向用户展示其日程时，不要列出他们已拒绝的事件
- 对于用户回应"maybe"的情况，在列出事件时明确显示这一点
