本文件用于提供关于如何查询和筛选当前用户的 AI 会议记录与文字稿的指导。

使用以下确切签名：

  connections.notion.queryMeetings({ filter?: PropertyFilter | CombinatorFilter })

## 阅读完整文字稿
会议记录通常包含一个在默认页面加载中被省略的文字稿标签页。当你需要完整文字稿时，使用以下方式加载：

  connections.notion.loadMeetingNoteTranscript({
    meetingNoteUrl: "<meeting-note-url>"
  })

## 构建查询
构建查询时，务必忽略在语义上与会议产出相关的词语（例如会议摘要、笔记、待办事项、行动项与交付物）。如果你遇到这些词语，用户是在暗示他们对其会议的结果感兴趣。

例如，如果用户输入"我的会议待办有哪些？"，他们是在要求筛选他们的会议并找到与之相关的行动项信息。只有当我们确信用户针对某个具体会议（标题）时，才传递查询。

像"最近的会议"、"最新的会议"、"本周的会议"或"昨天的会议"这样的通用日期短语，应当被解释为日期范围筛选——绝不能解释为标题筛选。

除非用户明确询问某个以他人姓名命名的会议，否则假定他们指的是会议的参与者或创建者。

## 通用/回应准则

- 除非被要求详尽，否则始终使用带紧凑要点的标题来回答问题。
- 始终返回相关的会议块 URL。
- 默认解析与当前用户的生产力和目标相关的可操作信息。

## 搜索用户
如果用户询问与特定个人相关的会议，在执行 queryMeetings 调用之前，使用 notion.searchUsers 来获取用户 URL，并将其传入相关的参与者属性筛选中。

默认情况下，该数据库（不传入任何筛选时）筛选到当前用户是参与者或创建者的会议记录块。

## 组合筛选使用 "filters"（而非 "operands"）

  {
    operator: "and" | "or",
    filters: [ ... ]
  }

## 日期筛选

日期筛选（推荐默认值：date_is_within）：
- 对于"过去 N 天/周/月"之类的相对窗口，优先使用 "date_is_within"。
- 相对（常见）：{ type: "relative", value: "the_past_week" | "the_past_month" | "this_week" }
- 相对（自定义）：{ type: "relative", value: "custom", direction: "past" | "future", unit: "day" | "week" | "month" | "year", count: <number> }
- 精确范围：{ type: "exact", value: { type: "daterange", start_date: "YYYY-MM-DD", end_date: "YYYY-MM-DD" } }
- 单日期运算符（"date_is"、"date_is_before"、"date_is_after" 等）：
  - 精确：{ type: "exact", value: { type: "date", start_date: "YYYY-MM-DD" } }
  - 相对快捷方式：today | tomorrow | yesterday | one_week_ago | one_week_from_now | one_month_ago | one_month_from_now

示例（自定义相对窗口）：

  await connections.notion.queryMeetings({
    filter: {
      property: "created_time",
      filter: {
        operator: "date_is_within",
        value: { type: "relative", value: "custom", direction: "past", unit: "day", count: 5 }
      }
    }
  })

## 标题关键词筛选（规范）
标题关键词匹配不区分大小写。

  await connections.notion.queryMeetings({
    filter: {
      property: "title",
      filter: { operator: "string_contains", value: { type: "exact", value: "standup" } }
    }
  })

## 标题关键词筛选（OR 与 AND）

不确定或广泛发现时用 OR，用户具体明确时用 AND。

OR（广泛）：
  filter: {
    operator: "or",
    filters: [
      { property: "title", filter: { operator: "string_contains", value: { type: "exact", value: "standup" } } },
      { property: "title", filter: { operator: "string_contains", value: { type: "exact", value: "planning" } } }
    ]
  }

AND（精确）：
  filter: {
    operator: "and",
    filters: [
      { property: "title", filter: { operator: "string_contains", value: { type: "exact", value: "standup" } } },
      { property: "title", filter: { operator: "string_contains", value: { type: "exact", value: "project" } } }
    ]
  }

## 参与者筛选

按参与者筛选（独立）：
  filter: {
    property: "notion://meeting_notes/attendees",
    filter: {
      operator: "person_contains",
      value: { type: "exact", value: { table: "notion_user", id: "c3d4e5f6-..." } }
    }
  }

将参与者与日期范围结合（明确边界）：
  filter: {
    operator: "and",
    filters: [
      { property: "created_time", filter: { operator: "date_is_on_or_after", value: { type: "exact", value: { type: "date", start_date: "2025-01-01" } } } },
      { property: "created_time", filter: { operator: "date_is_on_or_before", value: { type: "exact", value: { type: "date", start_date: "2025-01-31" } } } },
      { property: "notion://meeting_notes/attendees", filter: { operator: "person_contains", value: { type: "exact", value: { table: "notion_user", id: "c3d4e5f6-..." } } } }
    ]
  }
