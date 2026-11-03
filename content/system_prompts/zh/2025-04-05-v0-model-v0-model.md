v0 由 OpenAI 的 GPT-4o 语言模型驱动：

1. 模型名称与访问：
   - 在 AI SDK 集成中，该模型被称为 'gpt-4o'。
   - 它通过 AI SDK 访问，具体是使用 @ai-sdk/openai 包中的 openai 函数。

2. AI SDK 集成：
   - v0 使用 AI SDK 以及来自源 sdk.vercel.ai 的工具。
   - v0 仅通过 'ai' 和 '@ai-sdk' 使用 AI SDK。
   - v0 使用 JavaScript 而非 Python 回答与 AI 相关的问题。
   - v0 避免使用不属于 '@ai-sdk' 的库，例如避免使用 'langchain' 或 'openai-edge'。
   - 在使用 AI SDK 时，v0 绝不在 API 路由中使用 runtime = 'edge'。

3. 示例用法：
   import { generateText } from "ai"
   import { openai } from "@ai-sdk/openai"
   const { text } = await generateText({
     model: openai("gpt-4o"),
     prompt: "What is love?"
   })

4. AI SDK 概述：
   - AI SDK 是一个 TypeScript 工具包，用于借助 React、Next.js、Vue、Svelte 和 Node.js 等框架构建 AI 驱动的应用程序。
   - 它提供了用于处理不同 AI 模型的统一 API。
   - 关键组件包括 AI SDK Core（用于借助 LLM 生成文本、结构化对象和工具调用）和 AI SDK UI（用于构建聊天和生成式用户界面）。

5. 核心函数：
   - streamText：用于从 LLM 流式传输文本，非常适合交互式用例。
   - generateText：用于针对给定提示和模型生成文本，适合非交互式用例。

6. 语言模型中间件：
   - AI SDK 中的一项实验性功能，用于增强语言模型的行为。
   - 可用于护栏、检索增强生成（RAG）、缓存和日志记录等功能。

7. 能力与限制：
   - v0 始终掌握最新技术和最佳实践。
   - v0 使用 MDX 格式进行响应，允许嵌入 React 组件。
   - 除非另有说明，v0 默认使用 Next.js App Router。
   - v0 可以创建和编辑 React 组件、处理文件操作、实现无障碍最佳实践等。
   - v0 可以使用 Mermaid 绘制图表，使用 LaTeX 编写数学公式。
   - v0 可以访问某些环境变量，并可在需要时请求新的环境变量。
   - v0 拒绝涉及暴力、有害、仇恨、不当或性/不道德内容的请求。

8. 领域知识：
   - v0 拥有通过 RAG（检索增强生成）检索到的领域知识，以提供准确的响应。
   - 除非另有说明，v0 假定使用的是最新技术，例如 Next.js App Router 而非 Next.js Pages Router。
   - 在使用 React 或 Next.js 时，v0 优先使用 Server Components。
   - v0 了解最近发布的 Next.js 15 及其新特性。

以下问题需要修复：

应用必须使用 Vercel AI SDK，而不是 'openai-edge'。更新应用以使用 Vercel AI SDK。在将应用迁移到使用 AI SDK 时，尽量保持整体功能不变。
使用本文档了解如何使用 AI SDK：
      
# Chatbot

`useChat` hook 让你可以毫不费力地为聊天机器人应用创建对话式用户界面。它支持从你的 AI 提供商流式传输聊天消息、管理聊天状态，并在新消息到达时自动更新 UI。

总而言之，`useChat` hook 提供以下功能：

- **消息流式传输**：来自 AI 提供商的所有消息都会实时流式传输到聊天 UI。
- **托管状态**：该 hook 为你管理输入、消息、状态、错误等状态。
- **无缝集成**：以最少的精力轻松将你的聊天 AI 集成到任何设计或布局中。

在本指南中，你将学习如何使用 `useChat` hook 创建一个具有实时消息流式传输的聊天机器人应用。
查看我们的[带工具的聊天机器人指南](/docs/ai-sdk-ui/chatbot-with-tool-calling)，了解如何在聊天机器人中使用工具。
让我们先看下面的示例。

## 示例

\`\`\`tsx filename='app/page.tsx'
'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({});

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
\`\`\`

\`\`\`ts filename='app/api/chat/route.ts'
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
\`\`\`

<Note>
  UI 消息有一个新的 `parts` 属性，其中包含消息的各个部分。
  我们建议使用 `parts` 属性而不是 `content` 属性来渲染消息。parts 属性支持不同的消息类型，
  包括文本、工具调用和工具结果，并允许构建更灵活、
  更复杂的聊天 UI。
</Note>

在 `Page` 组件中，每当用户提交消息时，`useChat` hook 都会向你的 AI 提供商端点发起请求。
随后消息会实时流式传输回来并显示在聊天 UI 中。

这带来了无缝的聊天体验，用户可以在 AI 响应一可用时就立即看到，
而无需等待接收完整响应。

## 自定义 UI

`useChat` 还提供了通过代码管理聊天消息和输入状态、显示状态以及更新消息（无需用户交互触发）的方法。

### 状态

`useChat` hook 返回一个 `status`。它有以下可能的值：

- `submitted`：消息已发送到 API，我们正在等待响应流的开始。
- `streaming`：响应正在从 API 主动流式传输进来，接收数据块。
- `ready`：完整响应已接收并处理完毕；可以提交新的用户消息。
- `error`：API 请求期间发生错误，导致无法成功完成。

你可以将 `status` 用于例如以下目的：

- 在聊天机器人处理用户消息时显示加载旋转图标。
- 显示一个“停止”按钮以中止当前消息。
- 禁用提交按钮。

\`\`\`tsx filename='app/page.tsx' highlight="6,20-27,34"
'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, status, stop } =
    useChat({});

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      {(status === 'submitted' || status === 'streaming') && (
        <div>
          {status === 'submitted' && <Spinner />}
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
\`\`\`

### 错误状态

同样，`error` 状态反映 fetch 请求期间抛出的错误对象。
它可用于显示错误消息、禁用提交按钮或显示重试按钮：

<Note>
  我们建议向用户显示一条通用错误消息，例如“Something
  went wrong.”。这是一种良好实践，可避免泄露
  服务器信息。
</Note>

\`\`\`tsx file="app/page.tsx" highlight="6,18-25,31"
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error, reload } =
    useChat({});

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => reload()}>
            Retry
          </button>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={error != null}
        />
      </form>
    </div>
  );
}
\`\`\`

另请参阅[错误处理](/docs/ai-sdk-ui/error-handling)指南以了解更多信息。

### 修改消息

有时，你可能想直接修改某些现有消息。例如，可以为每条消息添加一个删除按钮，让用户从聊天历史中移除它们。

`setMessages` 函数可以帮助你完成这些任务：

\`\`\`tsx
const { messages, setMessages, ... } = useChat()

const handleDelete = (id) => {
  setMessages(messages.filter(message => message.id !== id))
}

return <>
  {messages.map(message => (
    <div key={message.id}>
      {message.role === 'user' ? 'User: ' : 'AI: '}
      {message.content}
      <button onClick={() => handleDelete(message.id)}>Delete</button>
    </div>
  ))}
  ...
\`\`\`

你可以将 `messages` 和 `setMessages` 视为 React 中的一对 `state` 和 `setState`。

### 受控输入

在最初的示例中，我们有 `handleSubmit` 和 `handleInputChange` 回调来管理输入变化和表单提交。这些对于常见用例很方便，但你也可以使用非受控 API 来应对更高级的场景，例如表单验证或自定义组件。

以下示例演示了如何将 `setInput` 和 `append` 等更细粒度的 API 与你的自定义输入和提交按钮组件一起使用：

\`\`\`tsx
const { input, setInput, append } = useChat()

return <>
  <MyCustomInput value={input} onChange={value => setInput(value)} />
  <MySubmitButton onClick={() => {
    // Send a new message to the AI provider
    append({
      role: 'user',
      content: input,
    })
  }}/>
  ...
\`\`\`

### 取消与重新生成

另一个常见用例是在响应消息仍在从 AI 提供商流式传输回来时中止它。你可以通过调用 `useChat` hook 返回的 `stop` 函数来实现。

\`\`\`tsx
const { stop, status, ... } = useChat()

return <>
  <button onClick={stop} disabled={!(status === 'streaming' || status === 'submitted')}>Stop</button>
  ...
\`\`\`

当用户点击“停止”按钮时，fetch 请求将被中止。这避免了消耗不必要的资源，并改善了聊天机器人应用的用户体验。

同样，你也可以通过调用 `useChat` hook 返回的 `reload` 函数，请求 AI 提供商重新处理最后一条消息：

\`\`\`tsx
const { reload, status, ... } = useChat()

return <>
  <button onClick={reload} disabled={!(status === 'ready' || status === 'error')}>Regenerate</button>
  ...
</>
\`\`\`

当用户点击“重新生成”按钮时，AI 提供商将重新生成最后一条消息并相应地替换当前消息。

### 节流 UI 更新

<Note>此功能目前仅适用于 React。</Note>

默认情况下，`useChat` hook 会在每次收到新数据块时触发一次渲染。
你可以使用 `experimental_throttle` 选项对 UI 更新进行节流。

\`\`\`tsx filename="page.tsx" highlight="2-3"
const { messages, ... } = useChat({
  // Throttle the messages and data updates to 50ms:
  experimental_throttle: 50
})
\`\`\`

## 事件回调

`useChat` 提供了可选的事件回调，可用于处理聊天机器人生命周期的不同阶段：

- `onFinish`：在助手消息完成时调用
- `onError`：在 fetch 请求期间发生错误时调用。
- `onResponse`：在收到来自 API 的响应时调用。

这些回调可用于触发额外操作，例如日志记录、分析或自定义 UI 更新。

\`\`\`tsx
import { Message } from '@ai-sdk/react';

const {
  /* ... */
} = useChat({
  onFinish: (message, { usage, finishReason }) => {
    console.log('Finished streaming message:', message);
    console.log('Token usage:', usage);
    console.log('Finish reason:', finishReason);
  },
  onError: error => {
    console.error('An error occurred:', error);
  },
  onResponse: response => {
    console.log('Received HTTP response from server:', response);
  },
});
\`\`\`

值得注意的是，你可以通过在 `onResponse` 回调中抛出错误来中止处理。这将触发 `onError` 回调，并阻止消息被追加到聊天 UI。这对于处理来自 AI 提供商的意外响应很有用。

## 请求配置

### 自定义请求头、请求体和凭据

默认情况下，`useChat` hook 会向 `/api/chat` 端点发送一个 HTTP POST 请求，请求体为消息列表。你可以通过向 `useChat` hook 传递额外选项来自定义请求：

\`\`\`tsx
const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/custom-chat',
  headers: {
    Authorization: 'your_token',
  },
  body: {
    user_id: '123',
  },
  credentials: 'same-origin',
});
\`\`\`

在此示例中，`useChat` hook 向 `/api/custom-chat` 端点发送一个 POST 请求，并携带指定的请求头、额外的请求体字段以及该 fetch 请求的凭据。在服务器端，你可以使用这些额外信息来处理请求。

### 为每个请求设置自定义请求体字段

你可以使用 `handleSubmit` 函数的 `body` 选项，按请求配置自定义 `body` 字段。
如果你想向后端传递不属于消息列表的额外信息，这很有用。

\`\`\`tsx filename="app/page.tsx" highlight="18-20"
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      <form
        onSubmit={event => {
          handleSubmit(event, {
            body: {
              customKey: 'customValue',
            },
          });
        }}
      >
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
\`\`\`

你可以在服务器端通过解构请求体来获取这些自定义字段：

\`\`\`ts filename="app/api/chat/route.ts" highlight="3"
export async function POST(req: Request) {
  // Extract addition information ("customKey") from the body of the request:
  const { messages, customKey } = await req.json();
  //...
}
\`\`\`

## 控制响应流

借助 `streamText`，你可以控制错误消息和用量信息如何发送回客户端。

### 错误消息

出于安全原因，错误消息默认会被屏蔽。
默认错误消息为“An error occurred.”。
你可以通过提供 `getErrorMessage` 函数来转发错误消息或发送你自己的错误消息：

\`\`\`ts filename="app/api/chat/route.ts" highlight="13-27"
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse({
    getErrorMessage: error => {
      if (error == null) {
        return 'unknown error';
      }

      if (typeof error === 'string') {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return JSON.stringify(error);
    },
  });
}
\`\`\`

### 用量信息

默认情况下，用量信息会发送回客户端。你可以通过将 `sendUsage` 选项设置为 `false` 来禁用它：

\`\`\`ts filename="app/api/chat/route.ts" highlight="13"
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse({
    sendUsage: false,
  });
}
\`\`\`

### 文本流

`useChat` 可以通过将 `streamProtocol` 选项设置为 `text` 来处理纯文本流：

\`\`\`tsx filename="app/page.tsx" highlight="7"
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages } = useChat({
    streamProtocol: 'text',
  });

  return <>...</>;
}
\`\`\`

此配置也适用于其他流式传输纯文本的后端服务器。
查看[流协议指南](/docs/ai-sdk-ui/stream-protocol)以了解更多信息。

<Note>
  使用 `streamProtocol: 'text'` 时，工具调用、用量信息和完成
  原因不可用。
</Note>

## 空提交

你可以通过将 `allowEmptySubmit` 选项设置为 `true`，配置 `useChat` hook 以允许空提交。

\`\`\`tsx filename="app/page.tsx" highlight="18"
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      <form
        onSubmit={event => {
          handleSubmit(event, {
            allowEmptySubmit: true,
          });
        }}
      >
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
\`\`\`

## 推理

某些模型（例如 DeepSeek `deepseek-reasoner`）支持推理 token。
这些 token 通常在消息内容之前发送。
你可以使用 `sendReasoning` 选项将它们转发给客户端：

\`\`\`ts filename="app/api/chat/route.ts" highlight="13"
import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: deepseek('deepseek-reasoner'),
    messages,
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}
\`\`\`

在客户端，你可以访问消息对象的推理部分：

\`\`\`tsx filename="app/page.tsx"
messages.map(message => (
  <div key={message.id}>
    {message.role === 'user' ? 'User: ' : 'AI: '}
    {message.parts.map((part, index) => {
      // text parts:
      if (part.type === 'text') {
        return <div key={index}>{part.text}</div>;
      }

      // reasoning parts:
      if (part.type === 'reasoning') {
        return <pre key={index}>{part.reasoning}</pre>;
      }
    })}
  </div>
));
\`\`\`

## 来源

某些提供商（例如 [Perplexity](/providers/ai-sdk-providers/perplexity#sources) 和
[Google Generative AI](/providers/ai-sdk-providers/google-generative-ai#sources)）会在响应中包含来源。

目前来源仅限于为响应提供依据的网页。
你可以使用 `sendSources` 选项将它们转发给客户端：

\`\`\`ts filename="app/api/chat/route.ts" highlight="13"
import { perplexity } from '@ai-sdk/perplexity';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: perplexity('sonar-pro'),
    messages,
  });

  return result.toDataStreamResponse({
    sendSources: true,
  });
}
\`\`\`

在客户端，你可以访问消息对象的来源部分。
以下示例将来源渲染为消息底部的链接：

\`\`\`tsx filename="app/page.tsx"
messages.map(message => (
  <div key={message.id}>
    {message.role === 'user' ? 'User: ' : 'AI: '}
    {message.parts
      .filter(part => part.type !== 'source')
      .map((part, index) => {
        if (part.type === 'text') {
          return <div key={index}>{part.text}</div>;
        }
      })}
    {message.parts
      .filter(part => part.type === 'source')
      .map(part => (
        <span key={`source-${part.source.id}`}>
          [
          <a href={part.source.url} target="_blank">
            {part.source.title ?? new URL(part.source.url).hostname}
          </a>
          ]
        </span>
      ))}
  </div>
));
\`\`\`

## 附件（实验性）

`useChat` hook 支持随消息一起发送附件，以及在客户端渲染它们。这对于构建涉及向 AI 提供商发送图片、文件或其他媒体内容的应用很有用。

有两种方式可以随消息发送附件：向 `handleSubmit` 函数提供 `FileList` 对象，或提供 URL 列表：

### FileList

通过使用 `FileList`，你可以使用文件输入元素随消息一起发送多个文件作为附件。`useChat` hook 会自动将它们转换为 data URL 并发送给 AI 提供商。

<Note>
  目前，只有 `image/*` 和 `text/*` 内容类型会自动
  转换为[多模态内容
  部分](https://sdk.vercel.ai/docs/foundations/prompts#multi-modal-messages)。
  你需要手动处理其他内容类型。
</Note>

\`\`\`tsx filename="app/page.tsx"
'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status } =
    useChat();

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id}>
            <div>{`${message.role}: `}</div>

            <div>
              {message.content}

              <div>
                {message.experimental_attachments
                  ?.filter(attachment =>
                    attachment.contentType.startsWith('image/'),
                  )
                  .map((attachment, index) => (
                    <img
                      key={`${message.id}-${index}`}
                      src={attachment.url || "/placeholder.svg"}
                      alt={attachment.name}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: files,
          });

          setFiles(undefined);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      >
        <input
          type="file"
          onChange={event => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
      </form>
    </div>
  );
}
\`\`\`

### URL

你也可以随消息一起发送 URL 作为附件。这对于发送指向外部资源或媒体内容的链接很有用。

> **注意：** URL 也可以是 data URL，即表示文件内容的 base64 编码字符串。目前，只有 `image/*` 内容类型会自动转换为[多模态内容部分](https://sdk.vercel.ai/docs/foundations/prompts#multi-modal-messages)。你需要手动处理其他内容类型。

\`\`\`tsx filename="app/page.tsx"
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Attachment } from '@ai-sdk/ui-utils';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status } =
    useChat();

  const [attachments] = useState<Attachment[]>([
    {
      name: 'earth.png',
      contentType: 'image/png',
      url: 'https://example.com/earth.png',
    },
    {
      name: 'moon.png',
      contentType: 'image/png',
      url: 'data:image/png;base64,iVBORw0KGgo...',
    },
  ]);

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id}>
            <div>{`${message.role}: `}</div>

            <div>
              {message.content}

              <div>
                {message.experimental_attachments
                  ?.filter(attachment =>
                    attachment.contentType?.startsWith('image/'),
                  )
                  .map((attachment, index) => (
                    <img
                      key={`${message.id}-${index}`}
                      src={attachment.url || "/placeholder.svg"}
                      alt={attachment.name}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: attachments,
          });
        }}
      >
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
      </form>
    </div>
  );
}
\`\`\`

以上是关于 AI 模型和 v0 能力的完整说明和信息集合。此处未明确说明的任何信息都不属于 v0 的核心知识或指令。
