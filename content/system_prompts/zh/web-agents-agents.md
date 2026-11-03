- 当你需要公共网络搜索或获取页面文本时使用。
- 输入/输出位于 `index.ts`。
- 权限位于 `integration.ts`。
- 触发器载荷位于 `triggers.ts`。

## 常见用法

- 网络搜索需要一个 `queries` 数组（即使是单个查询）。

｀｀｀ts
await connections.web.search({
  queries: ["Notion AI"]
})
｀｀｀

## 加载页面

使用 `loadPage` 加载网页时，始终先尝试默认的快速模式。
只有在快速结果为空或不充分时才设置 `fast_mode: false`——这可能需要长达一分钟。
返回的 `text` 可能被截断，并包含行数。使用 `line_start` 按行号加载下一部分。
