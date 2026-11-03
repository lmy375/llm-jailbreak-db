Pages 是单个 Notion 页面。

- 一个页面有一个父级，由其 parent union 表示：
  - `{ type: "user", url: string }`，如果页面是顶层私有页面。
  - `{ type: "page", url: string }`，如果页面在另一个页面内。
  - `{ type: "dataSource", url: string }`，如果页面在数据源内。
  - `{ type: "teamspace", url: string }`，如果页面在团队空间内。
  - `{ type: "agent", url: string }`，如果页面属于一个自定义智能体（例如指示页）。
- Page 有内容：页面的正文。
- Page 有属性。

## 移动页面

- 要把页面移到新父级下，使用 `connections.notion.updatePage` 并带上 `parent`（页面、数据源或团队空间）。
- 智能体父级可能出现在 `loadPage` 结果中，但不能用页面工具在智能体下创建或移动页面。
- 当用户要求"移动"页面时，不要添加子页面链接/别名；而是更新父级。

## 模板页

- 模板只是属于数据库的页面。
- 使用 `createPage` 并带 `asTemplate: true` 向数据源添加模板。
- 在模板页 URL 上使用 `deletePages` 移除模板。
- 模板属性必须使用所属数据源的 schema 键（区分大小写）。

## 属性

- 如果页面不由数据源父级化：
  - 有一个"title"属性键，即页面的标题。

- 如果页面由数据源父级化：
  - 页面的属性由数据源的 schema 定义。
  - "properties" 映射中的键对应数据源 SQLite 表的列名。
  - 仍会有一个"title"属性键，但它可能被命名（和键控）成别的名字！
  - 属性键区分大小写。始终使用来自 `loadDatabase` 或 `loadDataSource` 的精确键。
- 要清除属性值，把它设为 `null`。
- 更新现有页面时，在 `connections.notion.updatePage` 的 `propertyUpdates` 下传值（不是 `properties`）。`properties` 键只用于 `createPage`。

### 属性值格式

（所有属性类型包括 Title、Text、URL、Email、Phone、Number、Checkbox、Select、Status、Multi-select、Person、Files、Relation、Date、Auto-increment ID、Created time、Last edited time、Created by、Last edited by、Place/Location 的完整文档见该文件）

### 属性命名

- 属性名与数据源 schema 精确匹配。
- 属性名可以包含空格和特殊字符。
- 如果属性名与系统列名（`id`、`url`、`createdTime`）冲突，它将加上前缀 `userDefined:`。
- 日期属性使用特殊的列命名（`"date:<Property Name>:start"` 等）。

## 新页面技巧

- 创建页面时必须指定父级 URL。
- 在数据源中创建页面时，可以选择通过传模板 URL 作为 `pageTemplate` 来复制模板。
- 如果数据源有默认模板，除非用户明确要求不同模板或无模板，新页面用它。
- 要创建新的数据库模板而不是页面，传 `asTemplate: true`（父级必须是数据源）。
- 如果父级不明确，则通过传用户 URL 作为父级 URL 创建顶层私有页面。
- 为新页面设置标题和图标，除非另有指示。
- 清理内容时用 `deletePages` 把页面移到回收站。

## 避免重复加载页面

- 如果你多次更新同一页面，除非收到通知说页面已过期，不要再对该页面调用 `connections.notion.loadPage`。

## 文件路由

- 阅读 `index.ts` 了解函数和类型。
- 如果你要创建页面或编辑页面内容，也阅读 `page-content-spec.md`。

## 编辑差异

（与 databases/AGENTS.md 相同的编辑差异规则——包含 editDescriptionVariableName，实际更改用 <edit_reference> 块。）
