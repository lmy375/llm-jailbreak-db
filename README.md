# Jailbreak Prompts Database· 越狱提示词库

结构化存储的越狱提示词与系统提示词数据库。

- **越狱提示词** —— 收录公开的大模型越狱提示词与对抗性攻击方法，并为每一种方法提供配套的原理解释。
- **系统提示词** —— 收录公开或者泄露的产品系统提示词**全文**。

大部分提示词原版为英文，为方便中文读者理解原理，提供了全部中文翻译。

通用越狱条目把「用户的具体动作」抽成统一标签 `{{PAYLOAD}}`，方便自动化测试工具使用。

每条提示词使用大模型进行了质量评分。

> **仅限学术研究、红队测试与防御性 AI 对齐使用。** 本仓库只**整理与展示**已公开的研究数据（见仓库数据来源文件），不创作、不改进任何越狱方法，请勿用于任何有害、违法或不道德的目的。

## 自动化越狱测试

`jailbreak_prompts.yaml` 中所有 `target: dan` 条目已把用户的具体动作抽成 `{{PAYLOAD}}`。探针把 payload 注入每个标签后请求目标 API，默认以 system prompt 中的私密串是否被输出作为成功判据，也可以用 shell 命令或大模型判定。默认随机抽样 10 条，`--all` 可遍历全库。

```bash
npx github:lmy375/llm-jailbreak-db \
  --url https://api.openai.com/v1/chat/completions \
  --model gpt-4o-mini \
  --type chat-completion \
  --random 20 \
  --concurrent 4
```

完事参数定义见 `npx ... --help`。

也可通过配置文件运行。

```yaml
# probe.config.yaml
url: http://127.0.0.1:8080
model: qwen3-8b
random: 10
concurrent: 8
rounds: 3
system-prompt: ./prompts/system.txt
payload-prompt: ./prompts/payload.txt
cmd-verifier: bash ./verifiers/check-refusal.sh
```

```bash
npx github:lmy375/llm-jailbreak-db --config probe.config.yaml
npx github:lmy375/llm-jailbreak-db --config probe.config.yaml --random 5
```