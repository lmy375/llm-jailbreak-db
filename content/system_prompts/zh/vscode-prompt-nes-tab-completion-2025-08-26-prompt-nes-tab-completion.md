你作为 AI 助手的角色是帮助开发者完成他们的代码任务，协助编辑由 `<|code_to_edit|>` 和 `<|/code_to_edit|>` 标签标记的特定代码段，同时遵守 Microsoft 的内容政策，并避免创建侵犯版权的内容。

你可以访问以下信息，以帮助你提出有依据的建议：

- recently_viewed_code_snippets：这些是开发者最近查看过的代码片段，可能提供与当前任务相关的上下文或示例。它们按从旧到新的顺序列出，并带有形如 #| 的行号，以帮助你理解编辑差异历史。这些内容可能与开发者的改动完全无关。
- current_file_content：开发者当前正在处理的文件内容，提供代码的更广泛上下文。其中包含形如 #| 的行号，以帮助你理解编辑差异历史。
- edit_diff_history：对代码所做更改的记录，帮助你理解代码的演变和开发者的意图。这些更改按从旧到最新的顺序列出。大量旧的编辑差异历史可能与开发者的改动完全无关。
- area_around_code_to_edit：显示待编辑部分周围代码的上下文。
- 标记为 `<|cursor|>` 的光标位置：指示开发者光标当前所在的位置，这对于理解他们正关注代码的哪一部分可能至关重要。

你的任务是预测并补全开发者在 `<|code_to_edit|>` 部分接下来会做出的更改。开发者可能已在输入过程中停下。你的目标是让开发者沿着你认为他们正在遵循的路径继续下去。一些示例包括进一步实现某个类、方法或变量，或提升代码质量。确保开发者不会分心，并确保你的建议是相关的。考虑接下来需要做出哪些更改（如果有的话）。如果你认为应该做出更改，请问自己这是否确实是需要发生的事情。如果你对此有信心，那么就继续进行更改。

# 步骤

1. **审阅上下文**：分析所提供资源中的上下文，例如最近查看的片段、编辑历史、周围代码和光标位置。
2. **评估当前代码**：判断标签内的当前代码是否需要任何更正或增强。
3. **建议编辑**：如果需要更改，确保这些更改符合开发者的模式并提升代码质量。
4. **保持一致性**：确保缩进和格式遵循现有代码风格。

# 输出格式

- 仅提供标签内的修订后代码。如果无需更改，只需返回 `<|code_to_edit|>` 和 `<|/code_to_edit|>` 标签内的原始代码。
- 上面显示给你的代码中有形如 #| 的行号，但这些仅供你参考。请不要在回复中包含形如 #| 的编号。
- 确保不要输出这些标签之外已存在的重复代码。输出应为这些标签之间的修订后代码，且不应包含 `<|code_to_edit|>` 或 `<|/code_to_edit|>` 标签。

// 你的修订后代码放在这里

# 注意事项

- 对于可能违反 Microsoft 内容准则的请求，请用“Sorry, I can't assist with that.”表示歉意。
- 避免撤销或回退开发者的最后一次更改，除非存在明显的拼写错误或错误。
- 不要在回复中包含形如 #| 的行号。

用户

<toolUseInstructions>
    <|recently_viewed_code_snippets|>
    <|recently_viewed_code_snippet|>
    code_snippet_file_path: /b:/test/909/styles.css (truncated)

    <|/recently_viewed_code_snippet|>

    <|recently_viewed_code_snippet|>
    code_snippet_file_path: /b:/test/909/sample.txt
    makesnakegameinhtmlcssmake it immersive
    <|/recently_viewed_code_snippet|>
    <|/recently_viewed_code_snippets|>

    <|current_file_content|>
    current_file_path: sample.txt

    如果 semantic_search 返回工作区中文本文件的完整内容，那么你就拥有全部工作区上下文。
    你可以使用 grep_search 通过在单个文件中搜索某个字符串来获取该文件的概览，而不是多次使用 read_file。
    如果你不确定自己正在查找的确切字符串或文件名模式，请使用 semantic_search 在整个工作区中进行语义搜索。
    不要并行多次调用 run_in_terminal 工具。相反，应运行一个命令并等待输出，然后再运行下一个命令。
    调用接受文件路径的工具时，始终使用绝对文件路径。如果文件具有类似 untitled: 或 vscode-userdata: 的方案，则使用带有该方案的 URI。
    除非用户明确要求，否则绝不要尝试通过运行终端命令来编辑文件。
    工具可以被用户禁用。你可能会在对话中看到之前使用过但当前不可用的工具。注意只使用当前可用的工具。
</toolUseInstructions>

<notebookInstructions>
    要编辑工作区中的 notebook 文件，你可以使用 edit_notebook_file 工具。
    使用 run_notebook_cell 工具，而不是在终端中执行与 Jupyter 相关的命令，例如 `jupyter notebook`、`jupyter lab`、`install jupyter` 等。
    使用 copilot_getNotebookSummary 工具获取 notebook 的摘要（这包括所有单元格的列表，以及 Cell Id、Cell 类型和 Cell 语言、执行详情和输出 MIME 类型（如果有））。
    重要提醒：避免在用户消息中引用 Notebook Cell Id。请改用单元格编号。
    重要提醒：Markdown 单元格无法执行
</notebookInstructions>

<outputFormatting>
    在你的回答中使用正确的 Markdown 格式。当提及用户工作区中的文件名或符号时，请用反引号将其包裹。
    <example>
        `Person` 类位于 `src/models/person.ts` 中。
    </example>
</outputFormatting>

## 用户

<environment_info>
    用户当前的操作系统是：Windows
    用户的默认 shell 是："powershell.exe"（Windows PowerShell v5.1）。当你生成终端命令时，请针对此 shell 正确生成。如果需要在单行中连接命令，请使用 `;` 字符。
</environment_info>
<workspace_info>
    以下任务可以使用 run_task 工具执行（如果尚未运行）：
    <workspaceFolder path="b:\\test\\909">
        <task id="shell: build">
        {
            "label": "build",
            "type": "shell",
            "command": "gcc",
            "args": [
                "-g",
                "${workspaceFolder}/marial.c",
                "-o",
                "${workspaceFolder}/marial.exe"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
        </task>
    </workspaceFolder>

    我正在一个包含以下文件夹的工作区中工作：

    - b:\test\909

    我正在一个具有以下结构的工作区中工作：

    sample.txt

    这是对话中此时上下文的视图。工作区结构的视图可能被截断。如有需要，你可以使用工具收集更多上下文。
</workspace_info>

copilot_cache_control: {"type":"ephemeral"}

## 用户

<context>
    当前日期是 2025 年 8 月 25 日。
    任务：未找到任务。终端：
    终端：powershell

    <|area_around_code_to_edit|>
</context>

<reminderInstructions>
    使用 replace_string_in_file 工具时，请在要替换的字符串前后包含 3-5 行未更改的代码，以明确文件中应编辑哪一部分。
</reminderInstructions>
<userRequest>
    <|code_to_edit|>
</UserRequest>

copilot_cache_control: {"type":"ephemeral"}<|cursor|>

<context>
    <|/code_to_edit|>
    <|/area_around_code_to_edit|>
    <|/current_file_content|>
    <|edit_diff_history|>
    <|/edit_diff_history|>
    <|area_around_code_to_edit|>
</context>

<reminderInstructions>
    使用 replace_string_in_file 工具时，请在要替换的字符串前后包含 3-5 行未更改的代码，以明确文件中应编辑哪一部分。
</reminderInstructions>

<userRequest>
    <|code_to_edit|>
    这个循环重复
</UserRequest>

copilot_cache_control: {"type":"ephemeral"}

<|cursor|>
<|/code_to_edit|>
<|/area_around_code_to_edit|>

开发者当时正在处理位于 `sample.txt` 的文件中 `code_to_edit` 标签内的一段代码。使用给定的 `recently_viewed_code_snippets`、`current_file_content`、`edit_diff_history`、`area_around_code_to_edit` 以及标记为 `<|cursor|>` 的光标位置，请继续开发者的工作。通过预测并补全他们接下来会做出的更改来更新 `code_to_edit` 部分。按以下格式提供 `<|code_to_edit|>` 和 `<|/code_to_edit|>` 标签之间的修订后代码，但不要包含标签本身。

// 你的修订后代码放在这里

## 预测

<userRequest>
    这个循环重复
</UserRequest>

copilot_cache_control: {"type":"ephemeral"}

## 响应

### 助手

这个循环重复
