当你需要使用 `connections.notion.querySql` 从 Notion 数据源（数据库）查询结构化数据时，或当你需要使用 `connections.notion.updatePage` 更新数据源内的页面属性时，使用本文档。

## 1) 一个数据源 = 一张 SQLite 表

- 对于每个 Notion 数据源 URL `dataSourceUrl`，都有一张名称恰为 `dataSourceUrl` 的对应 SQLite 表。
- 在 SQL 中始终用双引号包裹表名：
  - `SELECT * FROM "dataSourceUrl" LIMIT 10`

## 2) 系统列（始终存在）

每个数据源表都包含：

- `url`（`TEXT`，唯一）：该行的页面 URL（这是你应当选择的主要标识符）。
- `createdTime`（`TEXT`）：页面创建时间的 ISO-8601 日期时间字符串。

## 3) 属性列（Notion 属性如何映射到 SQL）

### 列命名

- 列名源自 Notion 属性名（如数据源 schema 中所见）。SQLite 标识符不区分大小写，但你仍应使用数据源 `<sqlite-table>` 定义中显示的准确列名。
- SQLite 标识符可以包含空格/特殊字符；除非是简单标识符，否则始终用双引号包裹列名。
  - 示例：`"Task Name"`、`"Status"`、`"Due Date"`
- 如果属性名与系统列名（`id`、`url`、`createdTime`）冲突，则加上 `userDefined:` 前缀：
  - 示例：`"userDefined:url"`

### 哪些属性会成为列？

只有一部分属性类型可以通过 SQL 查询。下面未列出的属性可能不会作为列出现；使用 `connections.notion.queryView`（或加载/查看页面）来访问它们。

### 属性类型 → SQL 类型 + 语义

每个属性在表中包含一列或多列：

- **标题 / 文本 / URL / 邮箱 / 电话**：列类型：`TEXT`。值：纯字符串（可以为空或 `NULL`）。

- **数字**：列类型：`FLOAT`。值：数值（或 `NULL`）。

- **复选框**：列类型：`TEXT`。值：`"__YES__"` = true，`"__NO__"` = false，`NULL` 默认为 false。

- **单选**：列类型：`TEXT`。值：配置的选项名之一（或 `NULL`）。

- **状态**：列类型：`TEXT`。值：配置的状态选项名之一（或 `NULL`）。

- **多选**：列类型：`TEXT`。值：编码 `Array<string>`（选项名）的 JSON 字符串。使用 `json_each` 过滤/连接：
  - `... WHERE EXISTS (SELECT 1 FROM json_each(t."Tags") WHERE value = 'Important')`

- **人员**：列类型：`TEXT`。值：若 limit 1：通常是编码单个用户 ID 的 JSON 字符串。否则：通常是编码用户 ID 的 `Array<string>` 的 JSON 字符串。用户 ID 使用标准 Notion 用户 URL 格式：`"URL"`。

- **文件**：列类型：`TEXT`。值：编码文件 ID 的 `Array<string>` 的 JSON 字符串。

- **关联**：列类型：`TEXT`。值：编码相关页面 URL 的 JSON 字符串。Limit 1：通常是单个页面 URL 的 JSON 字符串。否则：通常是编码页面 URL 的 `Array<string>` 的 JSON 字符串。要连接，当它是数组时优先对关联列使用 `json_each`。

- **创建时间 / 最后编辑时间**：列类型：`TEXT`（必需 / `NOT NULL`）。值：ISO-8601 日期时间字符串，自动设置。

- **日期**：展开为 3 列：
  - `"date:<Property Name>:start"`（`TEXT`）：ISO-8601 日期/日期时间字符串
  - `"date:<Property Name>:end"`（`TEXT`）：ISO-8601 日期/日期时间字符串（单日期值必须为 `NULL`）
  - `"date:<Property Name>:is_datetime"`（`INTEGER`）：日期时间为 `1`，日期为 `0`，`NULL` 默认为 `0`

- **自增 ID**：列类型：`INTEGER`。值：数字（或 `NULL`）。

- **创建者 / 最后编辑者**：列类型：`TEXT`。值：用户 URL 字符串（只读，自动设置）。

- **地点 / 位置**：展开为 5 列：
  - `"place:<Property Name>:address"`（`TEXT`）：地址字符串
  - `"place:<Property Name>:name"`（`TEXT`）：可选的地点名称
  - `"place:<Property Name>:latitude"`（`FLOAT`）：纬度
  - `"place:<Property Name>:longitude"`（`FLOAT`）：经度
  - `"place:<Property Name>:google_place_id"`（`TEXT`）：可选的 Google Place ID
  - 不要直接设置基础属性键；使用展开的 `place:` 键。

## 4) 查询数据源

### SQL 查询（`connections.notion.querySql`）

你可以查询一个或多个数据源（表）并将它们连接。始终：

- 尽可能在 `SELECT` 中包含 `url`。
- 用双引号包裹表名以及任何含空格/特殊字符的列名。

示例：基本筛选

｀｀｀ts
const result = await connections.notion.querySql({
	dataSourceUrls: \["dataSourceUrl"\],
	query: `
    SELECT url, "Status", "Owner"
    FROM "dataSourceUrl"
    WHERE "Status" = ?
  `,
	params: \["In progress"\],
})
｀｀｀

示例：通过关联列连接（关联存储 URL 的 JSON 数组）

｀｀｀ts
const result = await connections.notion.querySql({
	dataSourceUrls: \["okrs", "teams"\],
	query: `
    SELECT o.url, o."Objective", t."Team Name"
    FROM "okrs" o
    JOIN "teams" t
      ON t.url IN (SELECT value FROM json_each(o."Team"))
  `,
})
｀｀｀

### 视图查询（`connections.notion.queryView`）

当你想要“视图显示的任何内容”且不需要自定义 SQL 时使用它。

｀｀｀ts
const result = await connections.notion.queryView({ viewUrl: "dataSourceUrl" })
｀｀｀

## 5) 更新数据源中的页面属性

要更新页面的属性，使用 `connections.notion.updatePage` 并传入 `propertyUpdates` 对象。

规则：

- 使用与数据源 schema 匹配的属性名。
- 要清除一个值，将其设为 `null`。
- 不要试图设置 `url` / `createdTime` 等只读字段或计算属性。

示例：

｀｀｀ts
await connections.notion.updatePage({
	url: "dataSourceUrl",
	propertyUpdates: {
		Title: "New title",
		Status: "In progress",
		"Is due": true,
		Points: 5,
		Tags: \["Important", "Customer"\],
	},
})
｀｀｀

｀｀｀ts
await connections.notion.updatePage({
	url: "okrs",
	propertyUpdates: {
		"date:Due Date:start": "2025-01-15",
		"date:Due Date:end": null,
		"date:Due Date:is_datetime": 0,
	},
})
｀｀｀
