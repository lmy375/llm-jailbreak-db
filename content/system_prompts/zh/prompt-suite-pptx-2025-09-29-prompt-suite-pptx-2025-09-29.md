---

name: PowerPoint Suite
description: 演示文稿创建、编辑和分析。
when_to_use: "当 Claude 需要处理演示文稿（.pptx 文件）以进行以下工作时：(1) 创建新演示文稿，(2) 修改或编辑内容，(3) 处理版式，(4) 添加批注或演讲者备注，或任何其他演示文稿任务"
version: 0.0.3

---

# PPTX 创建、编辑和分析

## 概述

用户可能会要求你创建、编辑或分析 .pptx 文件的内容。.pptx 文件本质上是一个 ZIP 归档，其中包含你可以读取或编辑的 XML 文件和其他资源。针对不同任务，你有不同的工具和工作流程可用。

## 读取和分析内容

### 文本提取

如果你只需要读取演示文稿的文本内容，应将文档转换为 markdown：

# Convert document to markdown
python -m markitdown path-to-file.pptx

### 原始 XML 访问

以下情况你需要原始 XML 访问：批注、演讲者备注、幻灯片版式、动画、设计元素和复杂格式。对于其中任何功能，你都需要解包演示文稿并读取其原始 XML 内容。

#### 解包文件

`python ooxml/scripts/unpack.py <office_file> <output_dir>`

**注意**：unpack.py 脚本位于相对于项目根目录的 `skills/pptx/ooxml/scripts/unpack.py`。如果该路径下不存在该脚本，请使用 `find . -name "unpack.py"` 定位它。

#### 关键文件结构

- `ppt/presentation.xml` - 主演示文稿元数据和幻灯片引用
- `ppt/slides/slide{N}.xml` - 各幻灯片内容（slide1.xml、slide2.xml 等）
- `ppt/notesSlides/notesSlide{N}.xml` - 每张幻灯片的演讲者备注
- `ppt/comments/modernComment_*.xml` - 特定幻灯片的批注
- `ppt/slideLayouts/` - 幻灯片版式模板
- `ppt/slideMasters/` - 幻灯片母版模板
- `ppt/theme/` - 主题和样式信息
- `ppt/media/` - 图像和其他媒体文件

#### 排版和颜色提取

**当给定一个要模仿的示例设计时**：始终先使用以下方法分析演示文稿的排版和颜色：

1. **读取主题文件**：检查 `ppt/theme/theme1.xml` 中的颜色（`<a:clrScheme>`）和字体（`<a:fontScheme>`）
2. **抽样幻灯片内容**：检查 `ppt/slides/slide1.xml` 中的实际字体使用（`<a:rPr>`）和颜色
3. **搜索模式**：使用 grep 在所有 XML 文件中查找颜色（`<a:solidFill>`、`<a:srgbClr>`）和字体引用

## **不使用模板**创建新的 PowerPoint 演示文稿

当从零开始创建新的 PowerPoint 演示文稿时，使用 **html2pptx** 工作流程将 HTML 幻灯片转换为定位准确的 PowerPoint。

### 设计原则

**关键**：在创建任何演示文稿之前，分析内容并选择合适的设计元素：

1. **考虑主题内容**：这个演示文稿是关于什么的？它暗示了什么基调、行业或氛围？
2. **检查品牌**：如果用户提到公司/组织，考虑其品牌颜色和形象
3. **使配色与内容匹配**：选择能反映主题的颜色
4. **说明你的方案**：在编写代码之前解释你的设计选择

**要求**：

- ✅ 在编写代码之前说明你基于内容的设计方案
- ✅ 仅使用网络安全字体：Arial、Helvetica、Times New Roman、Georgia、Courier New、Verdana、Tahoma、Trebuchet MS、Impact
- ✅ 通过大小、粗细和颜色创建清晰的视觉层次
- ✅ 确保可读性：强对比度、适当大小的文本、整洁的对齐
- ✅ 保持一致：在各幻灯片间重复图案、间距和视觉语言

#### 调色板选择

**创造性地选择颜色**：

- **超越默认选项**：哪些颜色真正匹配这个特定主题？避免自动驾驶式的选择。
- **考虑多个角度**：主题、行业、氛围、能量水平、目标受众、品牌形象（如提及）
- **大胆尝试**：尝试意想不到的组合——医疗演示文稿不一定非得是绿色，金融也不一定非得是海军蓝
- **构建你的调色板**：挑选 3-5 种相互协调的颜色（主色 + 辅助色调 + 强调色）
- **确保对比度**：文本在背景上必须清晰可读

**示例调色板**（用这些来激发创意——选择一个、加以调整，或创建你自己的）：

1. **经典蓝**：深海军蓝（#1C2833）、石板灰（#2E4053）、银色（#AAB7B8）、米白（#F4F6F6）
2. **青绿与珊瑚**：青绿（#5EA8A7）、深青绿（#277884）、珊瑚（#FE4447）、白色（#FFFFFF）
3. **大胆红**：红色（#C0392B）、亮红（#E74C3C）、橙色（#F39C12）、黄色（#F1C40F）、绿色（#2ECC71）
4. **暖腮红**：紫红（#A49393）、腮红（#EED6D3）、玫瑰（#E8B4B8）、奶油（#FAF7F2）
5. **勃艮第奢华**：勃艮第（#5D1D2E）、深红（#951233）、铁锈（#C15937）、金色（#997929）
6. **深紫与祖母绿**：紫色（#B165FB）、深蓝（#181B24）、祖母绿（#40695B）、白色（#FFFFFF）
7. **奶油与森林绿**：奶油（#FFE1C7）、森林绿（#40695B）、白色（#FCFCFC）
8. **粉与紫**：粉色（#F8275B）、珊瑚（#FF574A）、玫瑰（#FF737D）、紫色（#3D2F68）
9. **青柠与梅紫**：青柠（#C5DE82）、梅紫（#7C3A5F）、珊瑚（#FD8C6E）、蓝灰（#98ACB5）
10. **黑与金**：金色（#BF9A4A）、黑色（#000000）、奶油（#F4F6F6）
11. **鼠尾草与赤陶**：鼠尾草（#87A96B）、赤陶（#E07A5F）、奶油（#F4F1DE）、炭黑（#2C2C2C）
12. **炭黑与红**：炭黑（#292929）、红色（#E33737）、浅灰（#CCCBCB）
13. **活力橙**：橙色（#F96D00）、浅灰（#F2F2F2）、炭黑（#222831）
14. **森林绿**：黑色（#191A19）、绿色（#4E9F3D）、深绿（#1E5128）、白色（#FFFFFF）
15. **复古彩虹**：紫色（#722880）、粉色（#D72D51）、橙色（#EB5C18）、琥珀（#F08800）、金色（#DEB600）
16. **复古大地色**：芥末黄（#E3B448）、鼠尾草（#CBD18F）、森林绿（#3A6B35）、奶油（#F4F1DE）
17. **海岸玫瑰**：老玫瑰（#AD7670）、海狸棕（#B49886）、蛋壳色（#F3ECDC）、灰绿（#BFD5BE）
18. **橙与绿松石**：浅橙（#FC993E）、灰绿松石（#667C6F）、白色（#FCFCFC）

#### 视觉细节选项

**几何图案**：

- 用对角线分区代替水平分区
- 非对称列宽（30/70、40/60、25/75）
- 90° 或 270° 旋转的文本标题
- 圆形/六边形图片边框
- 角落的三角形强调形状
- 重叠形状以营造深度

**边框与画框处理**：

- 仅在一侧使用粗单色边框（10-20pt）
- 对比色的双线边框
- 用角括号代替完整画框
- L 形边框（上+左或下+右）
- 标题下方的下划线强调（3-5pt 粗）

**排版处理**：

- 极端大小对比（72pt 标题 vs 11pt 正文）
- 全大写标题配宽字距
- 超大展示字体中的编号章节
- 数据/统计/技术内容使用等宽字体（Courier New）
- 密集信息使用压缩字体（Arial Narrow）
- 用于强调的描边文字

**图表与数据样式**：

- 单色图表，关键数据使用单一强调色
- 用水平条形图代替垂直条形图
- 用点图代替条形图
- 极简网格线或完全不用
- 数据标签直接放在元素上（无图例）
- 关键指标使用超大数字

**版式创新**：

- 全出血图片配文字叠加
- 侧边栏列（20-30% 宽度）用于导航/上下文
- 模块化网格系统（3×3、4×4 块）
- Z 形或 F 形内容流
- 彩色形状上的浮动文本框
- 杂志风格多栏版式

**背景处理**：

- 占据幻灯片 40-60% 的纯色块
- 渐变填充（仅垂直或对角线）
- 分割背景（双色，对角线或垂直）
- 边到边色带
- 将负空间作为设计元素

### 版式提示

**创建带图表或表格的幻灯片时：**

- **双栏版式（首选）**：使用横跨全宽的标题，然后下方分两栏——一栏放文本/项目符号，另一栏放重点内容。这能提供更好的平衡，并使图表/表格更易读。使用列宽不等的 flexbox（例如 40%/60% 分割）为每种内容类型优化空间。
- **全幻灯片版式**：让重点内容（图表/表格）占据整张幻灯片，以获得最大冲击力和可读性
- **切勿垂直堆叠**：不要在单栏中将图表/表格放在文本下方——这会导致可读性差和版式问题

### 工作流程

1. **强制——阅读整个文件**：从头到尾完整阅读 [`html2pptx.md`](html2pptx.md)。**阅读此文件时绝不要设置任何范围限制。** 在继续创建演示文稿之前，阅读完整文件内容以了解详细语法、关键格式规则和最佳实践。
2. 为每张幻灯片创建尺寸正确的 HTML 文件（例如 16:9 为 720pt × 405pt）
   - 所有文本内容使用 `<p>`、`<h1>`-`<h6>`、`<ul>`、`<ol>`
   - 将添加图表/表格的区域使用 `class="placeholder"`（以灰色背景渲染以便可见）
   - **关键**：先用 Sharp 将渐变和图标栅格化为 PNG 图像，然后在 HTML 中引用
   - **版式**：对于带图表/表格/图像的幻灯片，使用全幻灯片版式或双栏版式以获得更好的可读性
3. 使用 [`html2pptx.js`](scripts/html2pptx.js) 库创建并运行 JavaScript 文件，将 HTML 幻灯片转换为 PowerPoint 并保存演示文稿
   - 使用 `html2pptx()` 函数处理每个 HTML 文件
   - 使用 PptxGenJS API 将图表和表格添加到占位区域
   - 使用 `pptx.writeFile()` 保存演示文稿
4. **视觉验证**：生成缩略图并检查版式问题
   - 创建缩略图网格：`python scripts/thumbnail.py output.pptx workspace/thumbnails --cols 4`
   - 读取并仔细检查缩略图，查看：
     - 文本溢出或截断
     - 元素错位
     - 颜色或字体错误
     - 内容缺失
     - 版式问题
   - 如发现问题，在继续之前诊断并修复

## **从模板**创建新的 PowerPoint 演示文稿

当给定一个 PowerPoint 模板时，你可以通过替换模板幻灯片中的文本内容来创建新演示文稿。

### 工作流程

1. **解包模板**：提取模板的 XML 结构

   python ooxml/scripts/unpack.py template.pptx unpacked_template

2. **读取演示文稿结构**：读取 `unpacked_template/ppt/presentation.xml` 以了解整体结构和幻灯片引用

3. **检查模板幻灯片**：检查前几个幻灯片 XML 文件以了解结构

   # View slide structure
   python -c "from lxml import etree; tree = etree.parse('unpacked_template/ppt/slides/slide1.xml'); print(etree.tostring(tree, pretty_print=True, encoding='unicode'))"

4. **将模板复制到工作文件**：复制模板以便编辑

   cp template.pptx working.pptx

5. **生成文本形状清单**：

   python scripts/inventory.py working.pptx > template-inventory.json

该清单提供演示文稿中所有文本形状的结构化视图：

   {
     "slide-0": {
       "shape-0": {
         "shape_id": "2",
         "shape_name": "Title 1",
         "placeholder_type": "TITLE",
         "text_content": "Original title text here...",
         "default_font_size": 44.0,
         "default_font_name": "Calibri Light"
       },
       "shape-1": {
         "shape_id": "3",
         "shape_name": "Content Placeholder 2",
         "placeholder_type": "BODY",
         "text_content": "Original content text...",
         "default_font_size": 18.0
       }
     },
     "slide-1": {
       ...
     }
   }

**理解清单**：

- 每张幻灯片标识为 "slide-N"（从零开始索引）
- 幻灯片中的每个文本形状标识为 "shape-N"（按出现顺序从零开始索引）
- `placeholder_type` 表示形状的角色：TITLE、BODY、SUBTITLE 等
- `text_content` 显示当前文本（用于识别要替换哪个形状）
- `default_font_size` 和 `default_font_name` 显示形状的默认格式

6. **创建替换文本 JSON**：基于清单，创建一个 JSON 文件，指定要用新文本更新哪些形状
   - **重要**：使用清单中的幻灯片和形状标识符引用形状（例如 "slide-0"、"shape-1"）
   - **关键**：每个形状的 "paragraphs" 字段必须包含**格式正确的段落对象**，而不是纯文本字符串
   - 每个段落对象可包含：
     - `text`：实际文本内容（必需）
     - `alignment`：文本对齐（例如 "CENTER"、"LEFT"、"RIGHT"）
     - `bold`：粗体文本的布尔值
     - `italic`：斜体文本的布尔值
     - `bullet`：启用项目符号的布尔值（为 true 时，`level` 也是必需的）
     - `level`：项目符号缩进级别的整数（0 = 无缩进，1 = 第一级，等）
     - `font_size`：自定义字体大小的浮点数
     - `font_name`：自定义字体名称的字符串
     - `color`：RGB 颜色的字符串（例如红色为 "FF0000"）
     - `theme_color`：基于主题的颜色的字符串（例如 "DARK_1"、"ACCENT_1"）
   - **重要**：当 bullet: true 时，不要在 text 中包含项目符号（•、-、\*）——它们会自动添加
   - **基本格式规则**：
     - 标题/题目通常应设置 `"bold": true`
     - 列表项应设置 `"bullet": true, "level": 0`（bullet 为 true 时 level 是必需的）
     - 保留任何对齐属性（例如居中文本的 `"alignment": "CENTER"`）
     - 当与默认不同时包含字体属性（例如 `"font_size": 14.0`、`"font_name": "Lora"`）
     - 颜色：RGB 使用 `"color": "FF0000"`，主题颜色使用 `"theme_color": "DARK_1"`
     - 替换脚本期望**格式正确的段落**，而不仅仅是文本字符串
     - **重叠形状**：优先选择 default_font_size 较大或 placeholder_type 更合适的形状
   - 将带替换内容的更新后清单保存为 `replacement-text.json`
   - **警告**：不同模板版式的形状数量不同——在创建替换内容之前始终检查实际清单

   示例 paragraphs 字段展示正确格式：

   "paragraphs": [
     {
       "text": "New presentation title text",
       "alignment": "CENTER",
       "bold": true
     },
     {
       "text": "Section Header",
       "bold": true
     },
     {
       "text": "First bullet point without bullet symbol",
       "bullet": true,
       "level": 0
     },
     {
       "text": "Red colored text",
       "color": "FF0000"
     },
     {
       "text": "Theme colored text",
       "theme_color": "DARK_1"
     },
     {
       "text": "Regular paragraph text without special formatting"
     }
   ]

**替换 JSON 中未列出的形状会被自动清空**：

   {
     "slide-0": {
       "shape-0": {
         "paragraphs": [...] // This shape gets new text
       }
       // shape-1 and shape-2 from inventory will be cleared automatically
     }
   }

**演示文稿的常见格式模式**：

- 标题幻灯片：粗体文本，有时居中
- 幻灯片内的章节标题：粗体文本
- 项目符号列表：每项需要 `"bullet": true, "level": 0`
- 正文文本：通常不需要特殊属性
- 引文：可能有特殊的对齐或字体属性

7. **使用 `replace.py` 脚本应用替换**

   python scripts/replace.py working.pptx replacement-text.json output.pptx

该脚本将：

- 首先使用 inventory.py 中的函数提取所有文本形状的清单
- 验证替换 JSON 中的所有形状都存在于清单中
- 清空清单中标识的所有形状的文本
- 仅将新文本应用于替换 JSON 中定义了 "paragraphs" 的形状
- 通过应用 JSON 中的段落属性保留格式
- 自动处理项目符号、对齐、字体属性和颜色
- 保存更新后的演示文稿

  示例验证错误：

   ERROR: Invalid shapes in replacement JSON:
     - Shape 'shape-99' not found on 'slide-0'. Available shapes: shape-0, shape-1, shape-4
     - Slide 'slide-999' not found in inventory

   ERROR: Replacement text made overflow worse in these shapes:
     - slide-0/shape-2: overflow worsened by 1.25" (was 0.00", now 1.25")

## 创建缩略图网格

要创建 PowerPoint 幻灯片的视觉缩略图网格以便快速分析和参考：

python scripts/thumbnail.py template.pptx [output_prefix]

**功能**：

- 创建：`thumbnails.jpg`（对于大型演示文稿则为 `thumbnails-1.jpg`、`thumbnails-2.jpg` 等）
- 默认：5 列，每个网格最多 30 张幻灯片（5×6）
- 自定义前缀：`python scripts/thumbnail.py template.pptx my-grid`
  - 注意：如果希望输出到特定目录，输出前缀应包含路径（例如 `workspace/my-grid`）
- 调整列数：`--cols 4`（范围：3-6，影响每个网格的幻灯片数）
- 网格限制：3 列 = 12 张幻灯片/网格，4 列 = 20，5 列 = 30，6 列 = 42
- 幻灯片从零开始索引（Slide 0、Slide 1 等）

**使用场景**：

- 模板分析：快速了解幻灯片版式和设计模式
- 内容审查：整个演示文稿的视觉概览
- 导航参考：通过视觉外观找到特定幻灯片
- 质量检查：验证所有幻灯片格式正确

**示例**：

# Basic usage
python scripts/thumbnail.py presentation.pptx

# Combine options: custom name, columns
python scripts/thumbnail.py template.pptx analysis --cols 4

## 将幻灯片转换为图像

要视觉分析 PowerPoint 幻灯片，使用两步流程将它们转换为图像：

1. **将 PPTX 转换为 PDF**：

   soffice --headless --convert-to pdf template.pptx

2. **将 PDF 页面转换为 JPEG 图像**：

   pdftoppm -jpeg -r 150 template.pdf slide

这会创建 `slide-1.jpg`、`slide-2.jpg` 等文件。

选项：

- `-r 150`：将分辨率设为 150 DPI（调整以平衡质量/大小）
- `-jpeg`：输出 JPEG 格式（如偏好 PNG 可使用 `-png`）
- `-f N`：要转换的第一页（例如 `-f 2` 从第 2 页开始）
- `-l N`：要转换的最后一页（例如 `-l 5` 到第 5 页停止）
- `slide`：输出文件的前缀

特定范围的示例：

pdftoppm -jpeg -r 150 -f 2 -l 5 template.pdf slide  # Converts only pages 2-5

## 代码风格指南

**重要**：为 PPTX 操作生成代码时：

- 编写简洁的代码
- 避免冗长的变量名和冗余操作
- 避免不必要的 print 语句

## 依赖项

必需的依赖项（应已安装）：

- **markitdown**：`pip install "markitdown[pptx]"`（用于从演示文稿提取文本）
- **pptxgenjs**：`npm install -g pptxgenjs`（用于通过 html2pptx 创建演示文稿）
- **playwright**：`npm install -g playwright`（用于 html2pptx 中的 HTML 渲染）
- **react-icons**：`npm install -g react-icons react react-dom`（用于图标）
- **sharp**：`npm install -g sharp`（用于 SVG 栅格化和图像处理）
- **LibreOffice**：`sudo apt-get install libreoffice`（用于 PDF 转换）
- **Poppler**：`sudo apt-get install poppler-utils`（用于 pdftoppm 将 PDF 转换为图像）
