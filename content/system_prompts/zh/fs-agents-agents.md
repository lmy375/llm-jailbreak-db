对脚本沙箱虚拟文件系统的只读访问。在 `index.ts` 中定义。

**`modules/` 下的路径：** 目录名是**模块类型**（例如 `notion`、`slack`、`mcpServer`），而不是连接名称。对于 MCP 服务器，所有服务器都使用 `modules/mcpServer/`（例如 `modules/mcpServer/index.ts`、`modules/mcpServer/AGENTS.md`）；像 `mcpServer_ramp` 这样的连接名称仅用于调用 `connections.mcpServer_ramp.runTool`，不能用于路径。

### 浏览目录

`readDir({ dir })` 返回目标文件夹中条目的平面列表。

｀｀｀ts
const { entries } = connections.fs.readDir({ dir: "modules/notion" })
// entries => ["index.ts", "agents", "databases"]
｀｀｀

### 读取文件

`readFiles({ files })` 返回每个文件的原始内容（包括文件 `path`）。

｀｀｀ts
const { files } = connections.fs.readFiles({
	files: ["modules/notion/index.ts"],
})
// files => [{ path: "modules/notion/index.ts", content: "..." }]
｀｀｀
