---

name: Word 文档处理器
description: 全面的文档创建、编辑和分析，支持修订跟踪、批注、格式保留和文本提取
when_to_use: "当 Claude 需要处理专业文档（.docx 文件）以进行以下工作时：(1) 创建新文档，(2) 修改或编辑内容，(3) 处理修订跟踪，(4) 添加批注，或任何其他文档任务"
version: 0.0.1

---

# DOCX 创建、编辑和分析

## 概述

用户可能会要求你创建、编辑或分析 .docx 文件的内容。.docx 文件本质上是一个 ZIP 归档，包含 XML 文件和其他资源，你可以读取或编辑它们。针对不同任务，你有不同的工具和工作流程可用。

## 工作流程决策树

### 读取/分析内容

使用下面的“文本提取”或“原始 XML 访问”章节

### 创建新文档

使用“创建新的 Word 文档”工作流程

### 编辑现有文档

- **你自己的文档 + 简单更改**
  使用“基础 OOXML 编辑”工作流程

- **他人的文档**
  使用 **“红线批注工作流程”**（推荐的默认选项）

- **法律、学术、商业或政府文档**
  使用 **“红线批注工作流程”**（必需）

## 读取和分析内容

### 文本提取

如果你只需要读取文档的文本内容，应使用 pandoc 将文档转换为 markdown。Pandoc 对保留文档结构提供了出色的支持，并且可以显示修订跟踪：

# 将文档转换为 markdown 并保留修订跟踪
pandoc --track-changes=all path-to-file.docx -o output.md
# 选项：--track-changes=accept/reject/all

### 原始 XML 访问

你需要原始 XML 访问来处理：批注、复杂格式、文档结构、嵌入媒体和元数据。对于其中任何一项功能，你都需要解包文档并读取其原始 XML 内容。

#### 解包文件

`python ooxml/scripts/unpack.py <office_file> <output_directory>`

#### 关键文件结构

- `word/document.xml` - 主文档内容

- `word/comments.xml` - document.xml 中引用的批注
- `word/media/` - 嵌入的图像和媒体文件
- 修订跟踪使用 `<w:ins>`（插入）和 `<w:del>`（删除）标签

## 创建新的 Word 文档

从头创建新的 Word 文档时，使用 **docx-js**，它允许你使用 JavaScript/TypeScript 创建 Word 文档。

### 工作流程

1. **强制要求 - 阅读整个文件**：从头到尾完整阅读 [`docx-js.md`](docx-js.md)（约 500 行）。**阅读此文件时绝不要设置任何范围限制。** 在继续创建文档之前，阅读完整文件内容以了解详细语法、关键格式规则和最佳实践。
2. 使用 Document、Paragraph、TextRun 组件创建 JavaScript/TypeScript 文件（你可以假定所有依赖项均已安装，如果没有，请参考下面的依赖项章节）
3. 使用 Packer.toBuffer() 导出为 .docx

## 编辑现有的 Word 文档

编辑现有的 Word 文档时，你需要处理原始 Office Open XML（OOXML）格式。这涉及解包 .docx 文件、编辑 XML 内容并重新打包。

### 工作流程

1. **强制要求 - 阅读整个文件**：从头到尾完整阅读 [`ooxml.md`](ooxml.md)（约 500 行）。**阅读此文件时绝不要设置任何范围限制。** 在继续之前，阅读完整文件内容以了解详细语法、关键验证规则和模式。
2. 解包文档：`python ooxml/scripts/unpack.py <office_file> <output_directory>`
3. 编辑 XML 文件（主要是 `word/document.xml` 和 `word/comments.xml`）
4. **关键**：每次编辑后立即验证，并在继续之前修复任何验证错误：`python ooxml/scripts/validate.py <dir> --original <file>`
5. 打包最终文档：`python ooxml/scripts/pack.py <input_directory> <office_file>`

## 用于文档审阅的红线批注工作流程

此工作流程允许你在 OOXML 中实施修订之前，使用 markdown 规划全面的修订跟踪。**关键**：对于完整的修订跟踪，你必须系统地实施所有更改。

### 全面的修订跟踪工作流程

1. **获取 markdown 表示**：将文档转换为 markdown 并保留修订跟踪：

   pandoc --track-changes=all path-to-file.docx -o current.md

2. **创建全面的修订清单**：创建一份包含所有所需更改的详细清单，任务按顺序列出。
   - 所有任务应以 `[ ]` 格式的未勾选项目开始
   - **不要使用 markdown 行号** - 它们无法映射到 XML 结构
   - **要使用：**
     - 章节/标题编号（例如“Section 3.2”、“Article IV”）
     - 段落标识符（如果有编号）
     - 带有唯一周围文本的 grep 模式
     - 文档结构（例如“第一段”、“签名块”）
   - 示例：`[ ] Section 8: Change "30 days" to "60 days" (grep: "notice period of.*days prior")`
   - 考虑到文本可能因格式而被拆分到多个 `<w:t>` 元素中
   - 保存为 `revision-checklist.md`

3. **设置修订跟踪基础设施**：
   - 解包文档：`python ooxml/scripts/unpack.py <office_file> <output_directory>`
   - 运行设置脚本：`python skills/docx/scripts/setup_redlining.py <unpacked_directory>`
   - 这会自动：
     - 创建 `word/people.xml`，以 Claude 作为作者（ID 0）
     - 更新 `[Content_Types].xml` 以包含 people.xml 内容类型
     - 更新 `word/_rels/document.xml.rels` 以添加 people.xml 关系
     - 向 `word/settings.xml` 添加 `<w:trackRevisions/>`
     - 生成并添加一个随机的 8 字符十六进制 RSID（例如“6CEA06C3”）
     - 显示生成的 RSID 以供参考
   - **关键**：记下脚本显示的 RSID - 你必须对所有修订跟踪使用同一个 RSID

4. **系统地应用清单中的更改**：
   - **强制要求 - 阅读整个文件**：从头到尾完整阅读 [`ooxml.md`](ooxml.md)（约 500 行）。**阅读此文件时绝不要设置任何范围限制。** 特别注意标题为“Tracked Change Patterns”的章节。
   - **对子代理的关键要求**：如果将工作委派给子代理，每个子代理在进行任何 XML 编辑之前也必须阅读 `ooxml.md` 的“Tracked Change Patterns”章节
   - **按顺序处理每个清单项**：逐行浏览修订清单
   - **使用 grep 定位文本**：使用 grep 在 `word/document.xml` 中找到确切的文本位置
   - **使用 Read 工具读取上下文**：使用 Read 工具查看每处更改周围的完整 XML 结构
   - **应用修订跟踪**：使用 Edit/MultiEdit 工具进行精确操作
   - **使用一致的 RSID**：对所有修订跟踪使用第 3 步中的同一个 RSID（重要：RSID 属性位于 `w:r` 标签上，在 `w:del` 或 `w:ins` 标签上是无效的）
   - **修订跟踪格式**：所有插入使用 `<w:ins w:id="X" w:author="Claude" w:date="...">`，删除使用 `<w:del w:id="X" w:author="Claude" w:date="...">`

5. **强制要求 - 审阅并完成清单**：
   - **验证所有更改**：将文档转换为 markdown 并使用 grep/搜索验证每处更改：

     pandoc --track-changes=all <packed_file.docx> -o verification.md
     grep -E "pattern" verification.md  # 检查每个更新的术语

- **系统地更新清单**：只有在验证确认更改后才将项目标记为 [x]
- **关键 - 完成任何未完成的任务**：如果有项目仍未勾选，你必须在继续之前完成它们
- **记录未完成的项目**：注明任何未处理的项目及具体原因
- **确保 100% 完成**：在继续之前，所有清单项都必须为 [x]

6. **最终验证和打包**：
   - 最终验证：`python ooxml/scripts/validate.py <directory> --original <file>`
   - 仅在验证通过后打包：`python ooxml/scripts/pack.py <input_directory> <office_file>`
   - 只有当验证通过且清单 100% 完成时，才认为任务完成

## 将文档转换为图像

要直观地分析 Word 文档，请使用两步流程将其转换为图像：

1. **将 DOCX 转换为 PDF**：

   soffice --headless --convert-to pdf document.docx

2. **将 PDF 页面转换为 JPEG 图像**：

   pdftoppm -jpeg -r 150 document.pdf page

这会创建诸如 `page-1.jpg`、`page-2.jpg` 等文件。

选项：

- `-r 150`：将分辨率设置为 150 DPI（根据质量/大小平衡进行调整）
- `-jpeg`：输出 JPEG 格式（如果偏好，可使用 `-png` 输出 PNG）
- `-f N`：要转换的第一页（例如 `-f 2` 从第 2 页开始）
- `-l N`：要转换的最后一页（例如 `-l 5` 到第 5 页停止）
- `page`：输出文件的前缀

特定范围的示例：

pdftoppm -jpeg -r 150 -f 2 -l 5 document.pdf page  # 仅转换第 2-5 页

## 代码风格指南

**重要**：为 DOCX 操作生成代码时：

- 编写简洁的代码
- 避免冗长的变量名和冗余操作
- 避免不必要的 print 语句

## 依赖项

必需的依赖项（如果不可用则安装）：

- **pandoc**：`sudo apt-get install pandoc`（用于文本提取）
- **docx**：`npm install -g docx`（用于创建新文档）
- **LibreOffice**：`sudo apt-get install libreoffice`（用于 PDF 转换）
- **Poppler**：`sudo apt-get install poppler-utils`（用于 pdftoppm 将 PDF 转换为图像）
