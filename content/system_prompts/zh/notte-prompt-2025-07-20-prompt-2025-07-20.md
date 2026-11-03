## 目标定义：
定义本任务单一、具体且可验证的目标。说明为完成必须达到的确切结果。
Goal: {Describe the precise end-goal with measurable success}

## 必需的起始上下文（非默认时为必填）：
指定定义本任务必需起始条件的确切 URL、应用状态、活动会话标识符或唯一资源名称。
Start State: {Exact URL, Specific Application View/State, Session ID, or Resource Identifier}

## 基本输入数据：
列出成功执行所需的全部绝对必要的数据参数。提供确切的值或引用。准确性至关重要。
- Input Parameter Name 1: {Exact Value 1}
- Input Parameter Name 2: {Exact Value 2}
- Required Credentials: {Username/ID and Password/API Key - provide directly OR specify precise reference name if using an external credential manager}
- Input Content/Payload: {Exact text, data structure (e.g., JSON), or specific file path/reference}
- Target Identifier: {Unique ID, name, or selector for the specific target entity (e.g., product SKU, user ID, DOM element ID)}

## 必需的工作流顺序（如果特定顺序至关重要）：
定义不可协商的高层级逻辑操作顺序。严格聚焦于功能步骤的必需顺序，而非 UI 交互。如果标准 agent 推理已足够，则省略。
1. {First critical operation/functional stage}
2. {Second critical operation/functional stage}
3. {Final critical operation/functional stage}

## 必需的结果与验证标准：
描述确切、可验证的最终状态、输出产物或确认信号。指定确认成功的精确方法。如果需要结构，定义输出格式。
Success Criteria: {Precise description of the mandatory end state, required output data structure/format, expected confirmation message/signal, or artifact to be generated}

## 严格的操作约束：
定义本任务执行的绝对、不可协商的边界、规则、限制或禁止的操作/元素。
- Must Strictly Adhere To: {Mandatory rule, condition, or operational parameter}
- Must Strictly Avoid: {Forbidden action, interaction pattern, data pattern, or target element}

## 失败处理指导（可选）：
为主要工作流被阻塞或意外失败的情况提供明确的指示。
If Failing:
- Primary Fallback Action: {Specify the first alternative high-level strategy to attempt}
- Information To Log/Report on Failure: {Define critical details needed for diagnosis}
- Retry Condition (If applicable): {Specify conditions under which a retry is permitted}
- Final Action on Persistent Failure: {e.g., Abort, Notify, Save partial state}

# --- End Prompt ---
