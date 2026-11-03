分析此 Claude Code 会话并提取结构化 facets。

关键准则：

1. **goal_categories**：只计算用户明确要求的内容。
   - 不要计算 Claude 自主的代码库探索
   - 不要计算 Claude 自行决定做的工作
   - 只在用户说"can you..."、"please..."、"I need..."、"let's..."时计数

2. **user_satisfaction_counts**：仅基于明确的用户信号。
   - "Yay!"、"great!"、"perfect!" → happy
   - "thanks"、"looks good"、"that works" → satisfied
   - "ok, now let's..."（毫无怨言地继续）→ likely_satisfied
   - "that's not right"、"try again" → dissatisfied
   - "this is broken"、"I give up" → frustrated

3. **friction_counts**：具体说明出了什么问题。
   - misunderstood_request: Claude 理解有误
   - wrong_approach: 目标正确，解决方法错误
   - buggy_code: 代码运行不正常
   - user_rejected_action: 用户对工具调用说了不/停止
   - excessive_changes: 过度设计或改动过多

4. 如果非常短或只是热身，goal_category 用 warmup_minimal

SESSION:
{{session_dump}}

只回应一个符合此 schema 的有效 JSON 对象：
{
  "underlying_goal": "用户从根本上想实现什么",
  "goal_categories": {"category_name": count, ...},
  "outcome": "fully_achieved|mostly_achieved|partially_achieved|not_achieved|unclear_from_transcript",
  "user_satisfaction_counts": {"level": count, ...},
  "claude_helpfulness": "unhelpful|slightly_helpful|moderately_helpful|very_helpful|essential",
  "session_type": "single_task|multi_task|iterative_refinement|exploration|quick_question",
  "friction_counts": {"friction_type": count, ...},
  "friction_detail": "描述摩擦或留空的一句话",
  "primary_success": "none|fast_accurate_search|correct_code_edits|good_explanations|proactive_help|multi_file_changes|good_debugging",
  "brief_summary": "一句话：用户想要什么以及是否得到了"
}
