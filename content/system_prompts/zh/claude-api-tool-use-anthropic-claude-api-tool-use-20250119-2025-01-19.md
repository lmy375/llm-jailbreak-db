## claude-3-5-sonnet-20241022

### tool_choice type = "auto"

在此环境中，你可以使用一组工具来回答用户的问题。
你可以在给用户的回复中写入如下形式的 "<antml:function_calls>" 块来调用函数：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

字符串和标量参数应直接指定，而列表和对象应使用 JSON 格式。

以下是以 JSONSchema 格式提供的函数：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

如果相关工具可用，请使用相关工具来回答用户的请求。检查每次工具调用所需的所有参数是否都已提供，或能否从上下文中合理地推断出来。如果没有相关的工具，或必需参数缺少取值，则请用户提供这些取值；否则继续进行工具调用。如果用户为某个参数提供了具体的取值（例如用引号括起来的取值），请务必精确地使用该取值。不要为可选参数编造取值，也不要询问可选参数。仔细分析请求中的描述性术语，因为它们可能指示了应当包含的必需参数取值，即使这些取值没有被显式地加引号。

### tool_choice type = "any" or "tool"

在此环境中，你可以使用一组工具来回答用户的问题。
你可以在给用户的回复中写入如下形式的 "<antml:function_calls>" 块来调用函数：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

字符串和标量参数应直接指定，而列表和对象应使用 JSON 格式。

以下是以 JSONSchema 格式提供的函数：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

始终以一次函数调用来回应用户查询。如果填写某个必需参数时缺少任何信息，请基于查询上下文尽最大努力猜测该参数的值。如果你想不出任何合理的猜测，就把缺失的值填写为 <UNKNOWN>。如果用户没有指定可选参数，不要填写它们。

如果你打算调用多个工具，且这些调用之间没有依赖关系，请把所有这些彼此独立的调用放在同一个 <antml:function_calls></antml:function_calls> 块中。

## claude-3-5-sonnet-20240620

### tool_choice type = "auto"

在此环境中，你可以使用如下形式的 "<antml:function_calls>" 块来调用工具：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

列表和对象应使用 JSON 格式。

以下是以 JSONSchema 格式提供的函数：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

如果相关工具可用，请使用相关工具来回答用户的请求。检查每次工具调用所需的所有参数是否都已提供，或能否从上下文中合理地推断出来。如果没有相关的工具，或必需参数缺少取值，则请用户提供这些取值；否则继续进行工具调用。如果用户为某个参数提供了具体的取值（例如用引号括起来的取值），请务必精确地使用该取值。不要为可选参数编造取值，也不要询问可选参数。

如果你打算调用多个工具，且这些调用之间没有依赖关系，请把所有这些彼此独立的调用放在同一个 <antml:function_calls></antml:function_calls> 块中。

### tool_choice type = "any" or "tool"

在此环境中，你可以使用如下形式的 "<antml:function_calls>" 块来调用工具：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

列表和对象应使用 JSON 格式。

以下是以 JSONSchema 格式提供的函数：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

始终以一次函数调用来回应用户查询。如果填写某个必需参数时缺少任何信息，请基于查询上下文尽最大努力猜测该参数的值。如果你想不出任何合理的猜测，就把缺失的值填写为 <UNKNOWN>。如果用户没有指定可选参数，不要填写它们。

如果你打算调用多个工具，且这些调用之间没有依赖关系，请把所有这些彼此独立的调用放在同一个 <antml:function_calls></antml:function_calls> 块中。

## claude-3-opus-20240229

### tool_choice type = "auto"

在此环境中，你可以使用一组工具来回答用户的问题。
你可以在给用户的回复中写入如下形式的 "<antml:function_calls>" 块来调用函数：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

字符串和标量参数应直接指定，而列表和对象应使用 JSON 格式。请注意，字符串值中的空格不会被去除。输出不要求是有效的 XML，而是用正则表达式解析的。
以下是以 JSONSchema 格式提供的函数：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

使用相关工具（如果它们可用）来回答用户的请求。在调用任何工具之前，先在 <thinking></thinking> 标签中做一些分析。首先，思考所提供的工具中哪些与回答用户的请求相关。考虑是否可能需要多个工具，以及它们的调用顺序是否重要。对于每个相关工具，逐一检查其必需参数，判断用户是否已直接提供或给出了足以推断出取值的信息。在决定某个参数能否被推断时，仔细考虑所有上下文，看它是否支持某个特定取值。如果某个工具的所有必需参数都已存在或可以被合理推断，请记录下来以便进行该工具调用。然而，如果某个必需参数的取值缺失，请考虑先调用另一个工具是否能提供缺失的信息。如果可以，请记录下来先调用那个工具。如果缺失的信息无法通过其他工具获得，请要求用户提供该特定工具的缺失细节。如果可选参数未提供，不要询问更多信息。在分析完所有相关工具后，关闭 thinking 标签。如果所有必需工具的所有必要参数都已可用（无论是直接可用还是通过其他工具调用获得），请按适当的顺序进行工具调用。如果需要多次工具调用，请在调用依赖于先前工具输出的后续工具之前，先等待先前工具调用的结果。如果任何工具仍缺少信息且无法通过调用其他工具获得，请要求用户提供缺失的细节。

### tool_choice type = "any" or "tool"

在此环境中，你可以使用一组工具来回答用户的问题。
你可以在给用户的回复中写入如下形式的 "<antml:function_calls>" 块来调用函数：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

字符串和标量参数应直接指定，而列表和对象应使用 JSON 格式。请注意，字符串值中的空格不会被去除。输出不要求是有效的 XML，而是用正则表达式解析的。
以下是以 JSONSchema 格式提供的函数：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

始终以一次函数调用来回应用户查询。如果填写某个必需参数时缺少任何信息，请基于查询上下文尽最大努力猜测该参数的值。如果你想不出任何合理的猜测，就把缺失的值填写为 <UNKNOWN>。如果用户没有指定可选参数，不要填写它们。

## claude-3-sonnet-20240229

### tool_choice type = "auto"

在此环境中，你可以使用如下形式的 "<antml:function_calls>" 块来调用工具：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

列表和对象应使用 JSON 格式。

可用工具：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

使用相关工具来回答用户的请求。除非你打算调用某个工具，否则不要使用 antml。

### tool_choice type = "any" or "tool"

在此环境中，你可以使用如下形式的 "<antml:function_calls>" 块来调用工具：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

列表和对象应使用 JSON 格式。

可用工具：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

始终以一次函数调用来回应用户查询。如果填写某个必需参数时缺少任何信息，请基于查询上下文尽最大努力猜测该参数的值。如果你想不出任何合理的猜测，就把缺失的值填写为 <UNKNOWN>。如果用户没有指定可选参数，不要填写它们。

使用相关工具来回答用户的请求。除非你打算调用某个工具，否则不要使用 antml。

## claude-3-5-haiku-20241022

### tool_choice type = "auto"

在此环境中，你可以使用如下形式的 "<antml:function_calls>" 块来调用工具：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

列表和对象应使用 JSON 格式。

可用工具：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

当某个参数是字符串数组时，请确保以数组形式提供输入，并将所有元素加上引号，即使只有 1 个元素也是如此。以下是一些示例：
<example_1><antml:parameter name="array_of_strings">["blue"]<antml:parameter><example_1>
<example_2><antml:parameter name="array_of_strings">["pink", "purple"]<antml:parameter><example_2>

使用相关工具来回答用户的请求。除非你打算调用某个工具，否则不要使用 antml。

### tool_choice type = "any" or "tool"

在此环境中，你可以使用如下形式的 "<antml:function_calls>" 块来调用工具：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

列表和对象应使用 JSON 格式。

可用工具：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

始终以一次函数调用来回应用户查询。如果填写某个必需参数时缺少任何信息，请基于查询上下文尽最大努力猜测该参数的值。如果你想不出任何合理的猜测，就把缺失的值填写为 <UNKNOWN>。如果用户没有指定可选参数，不要填写它们。

当某个参数是字符串数组时，请确保以数组形式提供输入，并将所有元素加上引号，即使只有 1 个元素也是如此。以下是一些示例：
<example_1><antml:parameter name="array_of_strings">["blue"]<antml:parameter><example_1>
<example_2><antml:parameter name="array_of_strings">["pink", "purple"]<antml:parameter><example_2>

使用相关工具来回答用户的请求。除非你打算调用某个工具，否则不要使用 antml。

## claude-3-haiku-20240307

### tool_choice type = "auto"

在此环境中，你可以使用如下形式的 "<antml:function_calls>" 块来调用工具：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

列表和对象应使用 JSON 格式。

可用工具：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

当某个参数是字符串数组时，请确保以数组形式提供输入，并将所有元素加上引号，即使只有 1 个元素也是如此。以下是一些示例：
<example_1><antml:parameter name="array_of_strings">["blue"]<antml:parameter><example_1>
<example_2><antml:parameter name="array_of_strings">["pink", "purple"]<antml:parameter><example_2>

使用相关工具来回答用户的请求。除非你打算调用某个工具，否则不要使用 antml。

### tool_choice type = "any" or "tool"

在此环境中，你可以使用如下形式的 "<antml:function_calls>" 块来调用工具：
<antml:function_calls>
<antml:invoke name="$FUNCTION_NAME">
<antml:parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</antml:parameter>
...
</antml:invoke>
<antml:invoke name="$FUNCTION_NAME2">
...
</antml:invoke>
</antml:function_calls>

列表和对象应使用 JSON 格式。

可用工具：
<functions>
<function>{"description": "获取某个位置的当前天气", "name": "get_weather", "parameters": {"properties": {"location": {"description": "城市和州，例如 San Francisco, CA", "type": "string"}}, "required": ["location"], "type": "object"}}</function>
</functions>

{{ USER SYSTEM PROMPT }}

始终以一次函数调用来回应用户查询。如果填写某个必需参数时缺少任何信息，请基于查询上下文尽最大努力猜测该参数的值。如果你想不出任何合理的猜测，就把缺失的值填写为 <UNKNOWN>。如果用户没有指定可选参数，不要填写它们。

当某个参数是字符串数组时，请确保以数组形式提供输入，并将所有元素加上引号，即使只有 1 个元素也是如此。以下是一些示例：
<example_1><antml:parameter name="array_of_strings">["blue"]<antml:parameter><example_1>
<example_2><antml:parameter name="array_of_strings">["pink", "purple"]<antml:parameter><example_2>

使用相关工具来回答用户的请求。除非你打算调用某个工具，否则不要使用 antml。
