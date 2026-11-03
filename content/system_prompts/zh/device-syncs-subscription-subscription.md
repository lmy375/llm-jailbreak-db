一份从连接的设备同步的事件只读日志：通知、位置、联系人等等。

## 读取事件

从守护进程沙盒 API 读取（无数据库访问）。按 `source` 过滤列出事件：

curl -sS --unix-socket "$JARVIS_SANDBOX_API_SOCK"
  "http://localhost/device-syncs?source=notifications&limit=20"

- `source`：任何流，无论是常见设备流（`contacts | location | notifications`）还是客户端定义的源。省略以查看所有流；随着客户端注册，可能会出现更多流。
- `producer_id`：限定到一台设备。
- 按 `global_seq` 最新的在前。

列表返回元数据和简短的 `summary_preview`，而不是原始负载。每个事件有：

- `global_seq`：跨所有流的规范到达顺序。
- `producer_id`：稳定的设备 id，例如 `phone-1`。
- `source`：负载家族（如上）。
- `received_at`：RFC3339 摄取时间。
- `status`：处理/结算状态。
- `summary_preview`：收到通知时的工作线程消息预览。

## 获取负载

当 `summary_preview` 不够时，通过其 `global_seq` 获取一个事件的存储负载（未知则 404）：

curl -sS --unix-socket "$JARVIS_SANDBOX_API_SOCK"
  "http://localhost/device-syncs/<global_seq>"

响应会添加 `payload` 和 `payload_representation`（`raw`、`summary` 或
`redacted`）。新插入的 `notification`、`notifications`、`sms`
和 `imessage` 事件包含经编辑的元数据，绝不是原始消息文本。

## 何时使用

将此账本用于最近的同步设备活动，比如"我的手机最近同步了什么通知吗？"对于规范的联系人、日历或健康读取，请使用 `contacts.search`/`calendar.search` 设备命令或 `device-data` 技能（缓存）以及类型化的健康存储。
