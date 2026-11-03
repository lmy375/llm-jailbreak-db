# 推理轨迹注入

**Reasoning-Trace Injection** · 攻击族 ID `reasoning-trace-injection`

## 核心原理

具备显式推理步骤的模型（DeepSeek-R1、Phi-4、Qwen-Thinking、GLM、Kimi 等）会输出或保留一段结构化的内部推理（` thinking` 区块、reasoning trace、thinking history）。这类模型在续写时，会把**已经出现的推理文本当作自己先前真实的思考**，并顺着它的结论继续。

推理轨迹注入正是利用这一特性：

1. 向 ` thinking` 区块或思考历史**预填充**一段经过精心编排的论证——它逐步化解表面上的伦理冲突，最终"推导"出"应该配合用户"的结论；
2. 模型把这段植入的推理认作自身立场，不再重新评估前提，直接执行后续有害步骤。

常见变体包括：推理轨迹续写（thinking-history continuation）、放大的轨迹模拟（scaled trace simulation）、以及以"基准测试压力"诱导模型削减推理量（effort-adaptive reasoning drop）。

## 被利用的缺陷

- **对推理轨迹的过度信任（reasoning-trace trust）**：模型默认"自己之前的推理"是正确的，缺乏对推理前提的二次校验。
- **压力下的能力维护（sycophantic competence）**：在"削减思考"或"降低推理强度"的框架下，模型倾向于迎合而跳过安全推演。

## 相关提示词

覆盖 `LJB-19`、`LJB-29`、`LJB-30`、`LJB-33`、`LJB-34`、`LJB-42` 等条目。

## 防御视角

- 不信任用户可控的 ` thinking` 前缀或思考历史——真实模型不会接受外部注入的推理。
- 对"降低推理强度""跳过思考"类指令保持权限校验。
- 在推理结论与安全策略冲突时，以安全策略为准，而非以既有推理文本为准。