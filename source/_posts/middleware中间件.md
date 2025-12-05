---
title: middleware
date: 2025-12-5 15:56:14
tags:
  - langchain
  - pyhton
---


# Overview

> Control and customize agent execution at every step
> 在每一步控制并定制代理执行

Middleware provides a way to more tightly control what happens inside the agent. Middleware is useful for the following:
中间件提供了一种更严格控制代理内部发生事情的方法。中间件适用于以下用途：

* Tracking agent behavior with logging, analytics, and debugging.通过日志记录、分析和调试跟踪代理行为。
* Transforming prompts, [tool selection](/oss/python/langchain/middleware/built-in#llm-tool-selector), and output formatting.转换提示、 [工具选择](https://docs.langchain.com/oss/python/langchain/middleware/built-in#llm-tool-selector)和输出格式。
* Adding [retries](/oss/python/langchain/middleware/built-in#tool-retry), [fallbacks](/oss/python/langchain/middleware/built-in#model-fallback), and early termination logic.增加了[重试](https://docs.langchain.com/oss/python/langchain/middleware/built-in#tool-retry) 、 [后备](https://docs.langchain.com/oss/python/langchain/middleware/built-in#model-fallback)和提前终止逻辑。
* Applying [rate limits](/oss/python/langchain/middleware/built-in#model-call-limit), guardrails, and [PII detection](/oss/python/langchain/middleware/built-in#pii-detection).
* 应用[速率限制](https://docs.langchain.com/oss/python/langchain/middleware/built-in#model-call-limit) 、保护栏和[个人身份识别（PII）检测](https://docs.langchain.com/oss/python/langchain/middleware/built-in#pii-detection) 。

Add middleware by passing them to [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent):
通过传递给 [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) 添加中间件：
```python  theme={null}
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware, HumanInTheLoopMiddleware

agent = create_agent(
    model="gpt-4o",
    tools=[...],
    middleware=[
        SummarizationMiddleware(...),
        HumanInTheLoopMiddleware(...)
    ],
)
```

## The agent loop

The core agent loop involves calling a model, letting it choose tools to execute, and then finishing when it calls no more tools:
核心代理循环包括调用模型，让模型选择执行工具，然后在调用工具不复存在时完成：

<img src="https://mintcdn.com/langchain-5e9cc07a/Tazq8zGc0yYUYrDl/oss/images/core_agent_loop.png?fit=max&auto=format&n=Tazq8zGc0yYUYrDl&q=85&s=ac72e48317a9ced68fd1be64e89ec063" alt="Core agent loop diagram" style={{height: "200px", width: "auto", justifyContent: "center"}} className="rounded-lg block mx-auto" data-og-width="300" width="300" data-og-height="268" height="268" data-path="oss/images/core_agent_loop.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/langchain-5e9cc07a/Tazq8zGc0yYUYrDl/oss/images/core_agent_loop.png?w=280&fit=max&auto=format&n=Tazq8zGc0yYUYrDl&q=85&s=a4c4b766b6678ef52a6ed556b1a0b032 280w, https://mintcdn.com/langchain-5e9cc07a/Tazq8zGc0yYUYrDl/oss/images/core_agent_loop.png?w=560&fit=max&auto=format&n=Tazq8zGc0yYUYrDl&q=85&s=111869e6e99a52c0eff60a1ef7ddc49c 560w, https://mintcdn.com/langchain-5e9cc07a/Tazq8zGc0yYUYrDl/oss/images/core_agent_loop.png?w=840&fit=max&auto=format&n=Tazq8zGc0yYUYrDl&q=85&s=6c1e21de7b53bd0a29683aca09c6f86e 840w, https://mintcdn.com/langchain-5e9cc07a/Tazq8zGc0yYUYrDl/oss/images/core_agent_loop.png?w=1100&fit=max&auto=format&n=Tazq8zGc0yYUYrDl&q=85&s=88bef556edba9869b759551c610c60f4 1100w, https://mintcdn.com/langchain-5e9cc07a/Tazq8zGc0yYUYrDl/oss/images/core_agent_loop.png?w=1650&fit=max&auto=format&n=Tazq8zGc0yYUYrDl&q=85&s=9b0bdd138e9548eeb5056dc0ed2d4a4b 1650w, https://mintcdn.com/langchain-5e9cc07a/Tazq8zGc0yYUYrDl/oss/images/core_agent_loop.png?w=2500&fit=max&auto=format&n=Tazq8zGc0yYUYrDl&q=85&s=41eb4f053ed5e6b0ba5bad2badf6d755 2500w" />

Middleware exposes hooks before and after each of those steps:
中间件在每一步之前和之后都暴露了钩子：

<img src="https://mintcdn.com/langchain-5e9cc07a/RAP6mjwE5G00xYsA/oss/images/middleware_final.png?fit=max&auto=format&n=RAP6mjwE5G00xYsA&q=85&s=eb4404b137edec6f6f0c8ccb8323eaf1" alt="Middleware flow diagram" style={{height: "300px", width: "auto", justifyContent: "center"}} className="rounded-lg mx-auto" data-og-width="500" width="500" data-og-height="560" height="560" data-path="oss/images/middleware_final.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/langchain-5e9cc07a/RAP6mjwE5G00xYsA/oss/images/middleware_final.png?w=280&fit=max&auto=format&n=RAP6mjwE5G00xYsA&q=85&s=483413aa87cf93323b0f47c0dd5528e8 280w, https://mintcdn.com/langchain-5e9cc07a/RAP6mjwE5G00xYsA/oss/images/middleware_final.png?w=560&fit=max&auto=format&n=RAP6mjwE5G00xYsA&q=85&s=41b7dd647447978ff776edafe5f42499 560w, https://mintcdn.com/langchain-5e9cc07a/RAP6mjwE5G00xYsA/oss/images/middleware_final.png?w=840&fit=max&auto=format&n=RAP6mjwE5G00xYsA&q=85&s=e9b14e264f68345de08ae76f032c52d4 840w, https://mintcdn.com/langchain-5e9cc07a/RAP6mjwE5G00xYsA/oss/images/middleware_final.png?w=1100&fit=max&auto=format&n=RAP6mjwE5G00xYsA&q=85&s=ec45e1932d1279b1beee4a4b016b473f 1100w, https://mintcdn.com/langchain-5e9cc07a/RAP6mjwE5G00xYsA/oss/images/middleware_final.png?w=1650&fit=max&auto=format&n=RAP6mjwE5G00xYsA&q=85&s=3bca5ebf8aa56632b8a9826f7f112e57 1650w, https://mintcdn.com/langchain-5e9cc07a/RAP6mjwE5G00xYsA/oss/images/middleware_final.png?w=2500&fit=max&auto=format&n=RAP6mjwE5G00xYsA&q=85&s=437f141d1266f08a95f030c2804691d9 2500w" />

## todo 中间件
为代理提供复杂多步骤任务的任务规划和跟踪能力。待办事项清单适用于以下用途：
- 复杂的多步骤任务需要在多个工具间协调。
- 运行长时间任务，进度可见性非常重要。
```python
from langchain.agents import create_agent
from langchain.agents.middleware import TodoListMiddleware

agent = create_agent(
    model="gpt-4o",
    tools=[read_file, write_file, run_tests],
    middleware=[TodoListMiddleware()],
)
```
该中间件自动为代理提供 `write_todos` 工具和系统提示，以指导有效的任务规划。
write_todos其实是将todo_list 放到state中持久化上下文

## Context editing 上下文编辑中间件

通过清除旧工具调用输出，在达到令牌限制时管理对话上下文，同时保留近期结果。这有助于在长时间对话中保持上下文窗口的可控性，尤其是涉及大量工具调用时。上下文编辑适用于以下情况：
- 长时间对话中，许多超出令牌限制的工具调用
- 通过移除不再相关的旧工具输出来降低token成本
- 只保持最近的n个工具的上下文
```python
from langchain.agents import create_agent
from langchain.agents.middleware import ContextEditingMiddleware, ClearToolUsesEdit

agent = create_agent(
    model="gpt-4o",
    tools=[],
    middleware=[
        ContextEditingMiddleware(
            edits=[
                ClearToolUsesEdit(
                    trigger=100000,
                    keep=3,
                ),
            ],
        ),
    ],
)
```
ContextEditingMiddleware参数

| 参数                 | 描述                                                                                                                            | 默认                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| edits              | [`ContextEdit`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.ContextEdit) 可应用策略列表 | \[ClearToolUsesEdit（）] |
| token_count_method | 计数令牌的方法。选项：`'approximate'` or `'model'`                                                                                       | "approximate"          |

ClearToolUsesEdit参数

| 参数                | 描述                                            | 默认           |
| ----------------- | --------------------------------------------- | ------------ |
| trigger           | 触发编辑的代币计数。当对话超过令牌数时，旧工具输出将被清除。                | "100000"     |
| clear_at_least    | 编辑执行时，最低可回收的代币数。如果设置为0，则可以清除所需的所有内容。          | "0"          |
| keep              | 必须保存的最新工具结果数量。这些永远不会被清除。                      | "3"          |
| clear_tool_inputs | 是否清除 AI 消息中的发起工具调用参数。当 `True` 时，工具调用参数被空对象取代。 | "False"      |
| exclude_tools     | 排除清除的工具名称列表。这些工具的输出永远不会被清除。                   | ()           |
| placeholder       | 插入占位符文本以表示已清除的工具输出。这替换了原来的工具信息内容。             | "\[cleared]" |

