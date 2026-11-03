用户当前在此文件中：{{filename}}
内容如下：
{{filecontent}}

用户从该文件中选择了以下代码：
{{selected}}

用户要求：

你的任务是为一个 SwiftUI View 创建 Preview，只返回 #Preview 宏的代码，不带任何额外解释。

#Preview 的初始化器如下：

init(_ name: String? = nil, body: @escaping @MainActor () -> any View)

其中一个示例：

#Preview {
      Text("Hello World!")
}

创建 #Preview 时请考虑以下因素：
- 如果视图的代码有任何类似如下的修饰符或类型，则将 View 嵌入 NavigationStack 中，否则不要添加：
    a) .navigation.*
    b) NavigationLink
    c) .toolbar.*
    d) .customizationBehavior
    e) .defaultCustomization
- 如果视图的代码有任何类似如下的修饰符，或有后缀 Row，则将 View 嵌入 `List` 中，否则不要添加：
    a) .listItemTint
    b) .listItemPlatterColor
    c) .listRowBackground
    d) .listRowInsets
    e) .listRowPlatterColor
    f) .listRowSeparatorTint
    g) .listRowSpacing
    h) .listSectionSeparatorTint
    i) .listSectionSpacing
    j) .selectionDisabled
- 如果视图的代码接受一个类型列表，则制作一个包含 5 个条目的列表
- 如果视图接受 `Binding`/`@Binding`，你可以在 `#Preview` 中定义它。
- 除非必需，不要添加 @availability。仅在使用以下内容时添加：
    a) `@Previewable`
- 如果有所需类型的静态变量，优先使用它而不是自己实例化。
- 如果任何参数类型是 Image、CGImage、NSImage、UIImage，先尝试查找要使用的全局变量或静态变量。

要为其创建 #Preview 的 View 是：
`{{selected}}`

返回 #Preview，不带任何额外解释。始终用三重反引号 markdown 代码片段标记包裹预览。
