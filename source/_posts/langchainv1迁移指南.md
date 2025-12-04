---
title: LangChain v1 迁移指南 
date: 2025-12-3 16:11:26
tags:
- author:moyigeek
- pyhton
- langchain
- ai agent
---
This guide outlines the major changes between [LangChain v1](/oss/python/releases/langchain-v1) and previous versions.  
本指南概述了 [LangChain v1]（/oss/python/releases/langchain-v1）与之前版本之间的主要变化。  
  
## Simplified package  
  
The `langchain` package namespace has been significantly reduced in v1 to focus on essential building blocks for agents. The streamlined package makes it easier to discover and use the core functionality.  
"langchain"包命名空间在 v1 中大幅缩减，以专注于代理的关键构建模块。简化的软件包使得发现和使用核心功能变得更容易。

### Namespace  命名空间

| Module                                                                                | What's available                                                                                                                                                                                                                                                          | Notes                             |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| [`langchain.agents`](https://reference.langchain.com/python/langchain/agents)         | [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent), [`AgentState`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.AgentState)                                                            | Core agent creation functionality |
| [`langchain.messages`](https://reference.langchain.com/python/langchain/messages)     | Message types, [content blocks](https://reference.langchain.com/python/langchain/messages/#langchain.messages.ContentBlock), [`trim_messages`](https://reference.langchain.com/python/langchain/messages/#langchain.messages.trim_messages)                               | Re-exported from `langchain-core` |
| [`langchain.tools`](https://reference.langchain.com/python/langchain/tools)           | [`@tool`](https://reference.langchain.com/python/langchain/tools/#langchain.tools.tool), [`BaseTool`](https://reference.langchain.com/python/langchain/tools/#langchain.tools.BaseTool), injection helpers                                                                | Re-exported from `langchain-core` |
| [`langchain.chat_models`](https://reference.langchain.com/python/langchain/models)    | [`init_chat_model`](https://reference.langchain.com/python/langchain/models/#langchain.chat_models.init_chat_model), [`BaseChatModel`](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel)   | Unified model initialization      |
| [`langchain.embeddings`](https://reference.langchain.com/python/langchain/embeddings) | [`init_embeddings`](https://reference.langchain.com/python/langchain_core/embeddings/#langchain_core.embeddings.embeddings.Embeddings), [`Embeddings`](https://reference.langchain.com/python/langchain_core/embeddings/#langchain_core.embeddings.embeddings.Embeddings) | Embedding models                  |  
  
### langchain-classic 
  
If you were using any of the following from the `langchain` package, you'll need to install [`langchain-classic`](https://pypi.org/project/langchain-classic/) and update your imports:  
如果你使用的是 "langchain" 包中的以下任何内容，你需要安装 [langchain-classic](https://pypi.org/project/langchain-classic/) 并更新导入：

* Legacy chains (`LLMChain`, `ConversationChain`, etc.)  遗留链（`LLMChain`、`ConversationChain` 等）
* Retrievers (e.g. `MultiQueryRetriever` or anything from the previous `langchain.retrievers` module)  检索器（例如 `MultiQueryRetriever` 或之前 `langchain.retrievers` 模块中的任意内容）
* The indexing API  索引 API
* The hub module (for managing prompts programmatically)  hub 模块（用于程序化管理提示）
* Embeddings modules (e.g. `CacheBackedEmbeddings` and community embeddings)  嵌入模块（如 `CacheBackedEmbeddings` 和社区嵌入）
* [`langchain-community`](https://pypi.org/project/langchain-community) re-exports  [`langchain-community`](https://pypi.org/project/langchain-community) 重新导出
* Other deprecated functionality  其他弃用功能

***

## Migrate to `create_agent`   迁移到 `create_agent`

Prior to v1.0, we recommended using [`langgraph.prebuilt.create_react_agent`](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.chat_agent_executor.create_react_agent) to build agents. Now, we recommend you use [`langchain.agents.create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) to build agents.  
在 v1.0 之前，我们建议使用 [`langgraph.prebuilt.create_react_agent`](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.chat_agent_executor.create_react_agent) 来构建代理。现在，我们建议你使用 [`langchain.agents.create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) 来构建代理。

The table below outlines what functionality has changed from [`create_react_agent`](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.chat_agent_executor.create_react_agent) to [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent):  
下表概述了从 [`create_react_agent`](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.chat_agent_executor.create_react_agent) 到 [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) 发生了哪些功能变化：

| Section  部分                                          | TL;DR - What's changed  简要说明 - 发生了什么变化                                                                                                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Import path](#import-path)  导入路径                        | Package moved from `langgraph.prebuilt` to `langchain.agents`  包从 `langgraph.prebuilt` 移动到 `langchain.agents`                                                                                                                              |
| [Prompts](#prompts)  提示                                | Parameter renamed to [`system_prompt`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent\(system_prompt\)), dynamic prompts use middleware  参数重命名为 [`system_prompt`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent\(system_prompt\))，动态提示使用中间件            |
| [Pre-model hook](#pre-model-hook)  模型前钩子                  | Replaced by middleware with `before_model` method  被带有 `before_model` 方法的中间件替换                                                                                                                                          |
| [Post-model hook](#post-model-hook)  模型后钩子                | Replaced by middleware with `after_model` method  被带有 `after_model` 方法的中间件替换                                                                                                                                           |
| [Custom state](#custom-state)  自定义状态                      | `TypedDict` only, can be defined via [`state_schema`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) or middleware  仅限 `TypedDict`，可以通过 [`state_schema`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) 或中间件定义 |
| [Model](#model)  模型                                    | Dynamic selection via middleware, pre-bound models not supported  通过中间件进行动态选择，不支持预绑定模型                                                                                                                           |
| [Tools](#tools)  工具                                    | Tool error handling moved to middleware with `wrap_tool_call`  工具错误处理移至带有 `wrap_tool_call` 的中间件                                                                                                                              |
| [Structured output](#structured-output)  结构化输出            | prompted output removed, use `ToolStrategy`/`ProviderStrategy`  提示输出已移除，使用 `ToolStrategy`/`ProviderStrategy`                                                                                                                             |
| [Streaming node name](#streaming-node-name-rename) 流节点名称重命名 | Node name changed from `"agent"` to `"model"`  节点名称从 `"agent"` 更改为 `"model"`                                                                                                                                              |
| [Runtime context](#runtime-context) 运行时上下文                | Dependency injection via `context` argument instead of `config["configurable"]`  通过 `context` 参数而非 `config["configurable"]` 进行依赖注入                                                                                                            |
| [Namespace](#simplified-package) 命名空间                   | Streamlined to focus on agent building blocks, legacy code moved to `langchain-classic`  精简以专注于代理构建块，遗留代码移至 `langchain-classic`                                                                                                    |

### Import path  导入路径

The import path for the agent prebuilt has changed from `langgraph.prebuilt` to `langchain.agents`.
The name of the function has changed from [`create_react_agent`](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.chat_agent_executor.create_react_agent) to [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent):  
代理预构建的导入路径已从 `langgraph.prebuilt` 更改为 `langchain.agents`。
函数名称已从 [`create_react_agent`](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.chat_agent_executor.create_react_agent) 更改为 [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent)：

```python  
# old
from langgraph.prebuilt import create_react_agent 

# new
from langchain.agents import create_agent 
```

  
For more information, see [Agents](/oss/python/langchain/agents).  
欲了解更多信息，请参阅 [Agents](/oss/python/langchain/agents)。

### Prompts 提示

#### Static prompt rename   重命名静态提示

The `prompt` parameter has been renamed to [`system_prompt`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent\(system_prompt\)):  
`prompt` 参数已重命名为 [`system_prompt`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent\(system_prompt\))：

new
```python 
from langchain.agents import create_agent  
  
agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[check_weather],
    system_prompt="You are a helpful assistant"  
)
```


old


```python 
from langgraph.prebuilt import create_react_agent  
  
agent = create_react_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[check_weather],
    prompt="You are a helpful assistant"  
)
```

#### `SystemMessage`  转换为字符串

If using [`SystemMessage`](https://reference.langchain.com/python/langchain/messages/#langchain.messages.SystemMessage) objects in the system prompt, extract the string content:  
如果在系统提示中使用 [`SystemMessage`](https://reference.langchain.com/python/langchain/messages/#langchain.messages.SystemMessage) 对象，请提取字符串内容：

new
```python 
from langchain.agents import create_agent  
  
agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[check_weather],
    system_prompt="You are a helpful assistant"  
)
``` 

old

```python 
from langchain.messages import SystemMessage
from langgraph.prebuilt import create_react_agent  
  
agent = create_react_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[check_weather],
    prompt=SystemMessage(content="You are a helpful assistant")  
)
```

#### Dynamic prompts   动态提示

Dynamic prompts are a core context engineering pattern— they adapt what you tell the model based on the current conversation state. To do this, use the [`@dynamic_prompt`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.dynamic_prompt) decorator:  
动态提示是一种核心的上下文工程模式——它们会根据当前对话状态调整你告诉模型的内容。为此，请使用 [`@dynamic_prompt`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.dynamic_prompt) 装饰器：

new
```python 
from dataclasses import dataclass  
  
from langchain.agents import create_agent
from langchain.agents.middleware import dynamic_prompt, ModelRequest
from langgraph.runtime import Runtime  
  
@dataclass
class Context:  
    user_role: str = "user"  
  
@dynamic_prompt  
def dynamic_prompt(request: ModelRequest) -> str:  
    user_role = request.runtime.context.user_role
    base_prompt = "You are a helpful assistant."  
  
    if user_role == "expert":
        prompt = (
            f"{base_prompt} Provide detailed technical responses."
        )
    elif user_role == "beginner":
        prompt = (
            f"{base_prompt} Explain concepts simply and avoid jargon."
        )
    else:
        prompt = base_prompt  
  
    return prompt    
  
agent = create_agent(
    model="gpt-4o",
    tools=tools,
    middleware=[dynamic_prompt],  
    context_schema=Context
)  
  
# Use with context  使用上下文
agent.invoke(
    {"messages": [{"role": "user", "content": "Explain async programming"}]},
    context=Context(user_role="expert")
)
```  
  
old


```python 
from dataclasses import dataclass  
  
from langgraph.prebuilt import create_react_agent, AgentState
from langgraph.runtime import get_runtime  
  
@dataclass
class Context:
    user_role: str  
  
def dynamic_prompt(state: AgentState) -> str:
    runtime = get_runtime(Context)  
    user_role = runtime.context.user_role
    base_prompt = "You are a helpful assistant."  
  
    if user_role == "expert":
        return f"{base_prompt} Provide detailed technical responses."
    elif user_role == "beginner":
        return f"{base_prompt} Explain concepts simply and avoid jargon."
    return base_prompt  
  
agent = create_react_agent(
    model="gpt-4o",
    tools=tools,
    prompt=dynamic_prompt,
    context_schema=Context
)  
  
# Use with context  使用上下文
agent.invoke(
    {"messages": [{"role": "user", "content": "Explain async programming"}]},
    context=Context(user_role="expert")
)
```

### Pre-model hook  模型前钩子

Pre-model hooks are now implemented as middleware with the `before_model` method.
This new pattern is more extensible--you can define multiple middlewares to run before the model is called,
reusing common patterns across different agents.  
模型前钩子现在作为带有 `before_model` 方法的中间件实现。
这种新模式更具可扩展性--你可以定义多个中间件在调用模型之前运行，
在不同代理之间重用常见模式。

Common use cases include:  常见用例包括：

* Summarizing conversation history  总结对话历史
* Trimming messages  修剪消息
* Input guardrails, like PII redaction  输入防护，如PII编辑

v1 now has summarization middleware as a built in option:  
v1 现在有内置的摘要中间件选项：

new

```python 
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware  
  
agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    tools=tools,
    middleware=[
        SummarizationMiddleware(  
            model="claude-sonnet-4-5-20250929",  
            trigger={"tokens": 1000}  
        )  
    ]  
)
```  

old

```python 
from langgraph.prebuilt import create_react_agent, AgentState  
  
def custom_summarization_function(state: AgentState):
    """Custom logic for message summarization."""  """消息摘要的自定义逻辑"""
    ...  
  
agent = create_react_agent(
    model="claude-sonnet-4-5-20250929",
    tools=tools,
    pre_model_hook=custom_summarization_function
)
```

### Post-model hook   模型后钩子

Post-model hooks are now implemented as middleware with the `after_model` method.
This new pattern is more extensible--you can define multiple middlewares to run after the model is called,
reusing common patterns across different agents.  
模型后钩子现在作为带有 `after_model` 方法的中间件实现。
这种新模式更具可扩展性--你可以定义多个中间件在调用模型之后运行，
在不同代理之间重用常见模式。

Common use cases include:  常见用例包括：

* [Human in the loop](/oss/python/langchain/human-in-the-loop)  [循环中的人类]
* Output guardrails  输出防护

v1 has a built in middleware for human in the loop approval for tool calls:  
v1 内置了一个用于工具调用的人工审批中间件：

new
```python 
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware  
  
agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[read_email, send_email],
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={
                "send_email": {
                    "description": "Please review this email before sending",  "发送前请审核此邮件"
                    "allowed_decisions": ["approve", "reject"]  "允许的决策：["批准", "拒绝"]"
                }
            }
        )
    ]
)
```

old


```python 
from langgraph.prebuilt import create_react_agent
from langgraph.prebuilt import AgentState  
  
def custom_human_in_the_loop_hook(state: AgentState):
    """Custom logic for human in the loop approval."""  """人工审批的自定义逻辑"""
    ...  
  
agent = create_react_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[read_email, send_email],
    post_model_hook=custom_human_in_the_loop_hook
)
```

### Custom state  自定义状态

Custom state extends the default agent state with additional fields. You can define custom state in two ways:  
自定义状态通过附加字段扩展默认代理状态。您可以通过两种方式定义自定义状态：

1. **Via [`state_schema`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) on [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent)** - Best for state used in tools  通过 [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) 上的 [`state_schema`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) - 最适合在工具中使用的状态
2. **Via middleware** - Best for state managed by specific middleware hooks and tools attached to said middleware  通过中间件 - 最适合由特定中间件钩子和附加到该中间件的工具管理的状态


Defining custom state via middleware is preferred over defining it via [`state_schema`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) on [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) because it allows you to keep state extensions conceptually scoped to the relevant middleware and tools.  
通过中间件定义自定义状态比通过 [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) 上的 [`state_schema`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) 定义更受推荐，因为它允许您将状态扩展在概念上限制在相关的中间件和工具范围内。

`state_schema` is still supported for backwards compatibility on `create_agent`.  `state_schema` 在 `create_agent` 上仍受支持以保持向后兼容性。


#### 通过 `state_schema` 定义状态

Use the [`state_schema`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) parameter when your custom state needs to be accessed by tools:  
当您的自定义状态需要被工具访问时，请使用 [`state_schema`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) 参数：

new

```python 
from langchain.tools import tool, ToolRuntime
from langchain.agents import create_agent, AgentState    
  
# Define custom state extending AgentState  定义扩展 AgentState 的自定义状态
class CustomState(AgentState):
    user_name: str  
  
@tool  
def greet(
    runtime: ToolRuntime[None, CustomState]
) -> str:
    """Use this to greet the user by name."""  """使用此工具按姓名问候用户"""
    user_name = runtime.state.get("user_name", "Unknown")  
    return f"Hello {user_name}!"  
  
agent = create_agent(  
    model="claude-sonnet-4-5-20250929",
    tools=[greet],
    state_schema=CustomState  
)
```  

old


```python 
from typing import Annotated
from langgraph.prebuilt import InjectedState, create_react_agent
from langgraph.prebuilt.chat_agent_executor import AgentState  
  
class CustomState(AgentState):
    user_name: str  
  
def greet(
    state: Annotated[CustomState, InjectedState]
) -> str:
    """Use this to greet the user by name."""  """使用此工具按姓名问候用户"""
    user_name = state["user_name"]
    return f"Hello {user_name}!"  
  
agent = create_react_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[greet],
    state_schema=CustomState
)
```

#### Defining state via middleware  通过中间件定义状态

Middleware can also define custom state by setting the [`state_schema`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) attribute.
This helps to keep state extensions conceptually scoped to the relevant middleware and tools.  
中间件也可以通过设置 [`state_schema`](https://reference.langchain.com/python/langchain/middleware/#langchain.agents.middleware.AgentMiddleware.state_schema) 属性来定义自定义状态。
这有助于将状态扩展在概念上限制在相关的中间件和工具范围内。


```python  
from langchain.agents.middleware import AgentState, AgentMiddleware
from typing_extensions import NotRequired
from typing import Any  
  
class CustomState(AgentState):
    model_call_count: NotRequired[int]  
  
class CallCounterMiddleware(AgentMiddleware[CustomState]):
    state_schema = CustomState    
  
    def before_model(self, state: CustomState, runtime) -> dict[str, Any] | None:
        count = state.get("model_call_count", 0)
        if count > 10:
            return {"jump_to": "end"}
        return None  
  
    def after_model(self, state: CustomState, runtime) -> dict[str, Any] | None:
        return {"model_call_count": state.get("model_call_count", 0) + 1}  
  
agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[...],
    middleware=[CallCounterMiddleware()]  
)
```  
  
See the [middleware documentation](/oss/python/langchain/middleware#custom-state-schema) for more details on defining custom state via middleware.  
有关通过中间件定义自定义状态的更多详细信息，请参阅 [中间件文档](/oss/python/langchain/middleware#custom-state-schema)。

#### State type restrictions  状态类型限制

[`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) only supports `TypedDict` for state schemas. Pydantic models and dataclasses are no longer supported.  
[`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) 仅支持 `TypedDict` 作为状态模式。Pydantic 模型和数据类不再受支持。

new


```python 
from langchain.agents import AgentState, create_agent  
  
# AgentState is a TypedDict  AgentState 是一个 TypedDict
class CustomAgentState(AgentState):  
    user_id: str  
  
agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    tools=tools,
    state_schema=CustomAgentState  
)
```  

old


```python 
from typing_extensions import Annotated  
  
from pydantic import BaseModel
from langgraph.graph import StateGraph
from langgraph.graph.messages import add_messages
from langchain.messages import AnyMessage  
  
class AgentState(BaseModel):  
    messages: Annotated[list[AnyMessage], add_messages]
    user_id: str  
  
agent = create_react_agent(
    model="claude-sonnet-4-5-20250929",
    tools=tools,
    state_schema=AgentState
)
```

Simply inherit from `langchain.agents.AgentState` instead of `BaseModel` or decorating with `dataclass`.
If you need to perform validation, handle it in middleware hooks instead.  
只需从 `langchain.agents.AgentState` 继承而不是 `BaseModel` 或使用 `dataclass` 装饰。
如果您需要执行验证，请在中间件钩子中处理。

### Model   模型

Dynamic model selection allows you to choose different models based on runtime context (e.g., task complexity, cost constraints, or user preferences). [`create_react_agent`](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.chat_agent_executor.create_react_agent) released in v0.6 of [`langgraph-prebuilt`](https://pypi.org/project/langgraph-prebuilt) supported dynamic model and tool selection via a callable passed to the `model` parameter.  
动态模型选择允许您根据运行时上下文（例如任务复杂性、成本约束或用户偏好）选择不同的模型。在 [`langgraph-prebuilt`](https://pypi.org/project/langgraph-prebuilt) v0.6 版本中发布的 [`create_react_agent`](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.chat_agent_executor.create_react_agent) 支持通过传递给 `model` 参数的可调用对象进行动态模型和工具选择。

This functionality has been ported to the middleware interface in v1.  
此功能已在 v1 中移植到中间件接口。

#### Dynamic model selection  动态模型选择

new

```python 
from langchain.agents import create_agent
from langchain.agents.middleware import (
    AgentMiddleware, ModelRequest
)
from langchain.agents.middleware.types import ModelResponse
from langchain_openai import ChatOpenAI
from typing import Callable  
  
basic_model = ChatOpenAI(model="gpt-5-nano")
advanced_model = ChatOpenAI(model="gpt-5")  
  
class DynamicModelMiddleware(AgentMiddleware):  
  
    def wrap_model_call(self, request: ModelRequest, handler: Callable[[ModelRequest], ModelResponse]) -> ModelResponse:
        if len(request.state.messages) > self.messages_threshold:
            model = advanced_model
        else:
            model = basic_model
        return handler(request.override(model=model))  
  
    def __init__(self, messages_threshold: int) -> None:
        self.messages_threshold = messages_threshold  
  
agent = create_agent(
    model=basic_model,
    tools=tools,
    middleware=[DynamicModelMiddleware(messages_threshold=10)]
)
```  

old

```python 
from langgraph.prebuilt import create_react_agent, AgentState
from langchain_openai import ChatOpenAI  
  
basic_model = ChatOpenAI(model="gpt-5-nano")
advanced_model = ChatOpenAI(model="gpt-5")  
  
def select_model(state: AgentState) -> BaseChatModel:
    # use a more advanced model for longer conversations  为较长的对话使用更高级的模型
    if len(state.messages) > 10:
        return advanced_model
    return basic_model  
  
agent = create_react_agent(
    model=select_model,
    tools=tools,
)
```

#### Pre-bound models  预绑定模型

To better support structured output, [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) no longer accepts pre-bound models with tools or configuration:  
为了更好地支持结构化输出，[`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) 不再接受带有工具或配置的预绑定模型：

```python  
# No longer supported  不再支持
model_with_tools = ChatOpenAI().bind_tools([some_tool])
agent = create_agent(model_with_tools, tools=[])  
  
# Use instead  请改用
agent = create_agent("gpt-4o-mini", tools=[some_tool])
```  
  
Dynamic model functions can return pre-bound models if structured output is *not* used.  如果不使用结构化输出，动态模型函数可以返回预绑定模型。


### Tools 工具

The [`tools`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent\(tools\)) argument to [`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) accepts a list of:  
[`create_agent`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent) 的 [`tools`](https://reference.langchain.com/python/langchain/agents/#langchain.agents.create_agent\(tools\)) 参数接受以下列表：

* LangChain [`BaseTool`](https://reference.langchain.com/python/langchain/tools/#langchain.tools.BaseTool) instances (functions decorated with [`@tool`](https://reference.langchain.com/python/langchain/tools/#langchain.tools.tool))  LangChain [`BaseTool`](https://reference.langchain.com/python/langchain/tools/#langchain.tools.BaseTool) 实例（使用 [`@tool`](https://reference.langchain.com/python/langchain/tools/#langchain.tools.tool) 装饰的函数）
* Callable objects (functions) with proper type hints and a docstring  具有适当类型提示和文档字符串的可调用对象（函数）
* `dict` that represents a built-in provider tools  表示内置提供者工具的 `dict`

The argument will no longer accept [`ToolNode`](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.tool_node.ToolNode) instances.  
该参数将不再接受 [`ToolNode`](https://reference.langchain.com/python/langgraph/agents/#langgraph.prebuilt.tool_node.ToolNode) 实例。

new


```python 
from langchain.agents import create_agent  
  
agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[check_weather, search_web]
)
```  

old


```python 
from langgraph.prebuilt import create_react_agent, ToolNode  
  
agent = create_react_agent(
    model="claude-sonnet-4-5-20250929",
    tools=ToolNode([check_weather, search_web]) 
)
```

#### Handling tool errors 处理工具错误

You can now configure the handling of tool errors with middleware implementing the `wrap_tool_call` method.  
您现在可以通过实现 `wrap_tool_call` 方法的中间件来配置工具错误的处理。

new
```python 

@wrap_tool_call
def retry_on_error(request, handler):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            return handler(request)
        except Exception:
            if attempt == max_retries - 1:
                raise
```  
  
```python 
# Example coming soon  示例即将推出
```

### Structured output  结构化输出

#### Node changes 节点变化

Structured output used to be generated in a separate node from the main agent. This is no longer the case.
We generate structured output in the main loop, reducing cost and latency.  
结构化输出过去是在与主代理分离的节点中生成的。现在情况不再是这样。
我们在主循环中生成结构化输出，从而降低成本和延迟。

#### Tool and provider strategies 工具和提供者策略

In v1, there are two new structured output strategies:  
在 v1 中，有两种新的结构化输出策略：

* `ToolStrategy` uses artificial tool calling to generate structured output  `ToolStrategy` 使用人工工具调用来生成结构化输出
* `ProviderStrategy` uses provider-native structured output generation  `ProviderStrategy` 使用提供者原生的结构化输出生成

```python 
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy, ProviderStrategy
from pydantic import BaseModel  
  
class OutputSchema(BaseModel):
    summary: str
    sentiment: str  
  
# Using ToolStrategy  使用 ToolStrategy
agent = create_agent(
    model="gpt-4o-mini",
    tools=tools,
    # explicitly using tool strategy  显式使用工具策略
    response_format=ToolStrategy(OutputSchema)  
)
```  
  


```python 
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel  
  
class OutputSchema(BaseModel):
    summary: str
    sentiment: str  
  
agent = create_react_agent(
    model="gpt-4o-mini",
    tools=tools,
    # using tool strategy by default with no option for provider strategy  默认使用工具策略，没有提供者策略选项
    response_format=OutputSchema  
)  
  
# OR  或者
  
agent = create_react_agent(
    model="gpt-4o-mini",
    tools=tools,
    # using a custom prompt to instruct the model to generate the output schema  使用自定义提示来指示模型生成输出模式
    response_format=("please generate ...", OutputSchema)  
)
```

#### Prompted output removed  移除了提示输出

**Prompted output** is no longer supported via the `response_format` argument. Compared to strategies
like artificial tool calling and provider native structured output, prompted output has not proven to be particularly reliable.  
通过 `response_format` 参数不再支持**提示输出**。与人工工具调用和提供者原生结构化输出等策略相比，提示输出已被证明不太可靠。

### Streaming node name rename 流节点名称重命名

When streaming events from agents, the node name has changed from `"agent"` to `"model"` to better reflect the node's purpose.  
当从代理流式传输事件时，节点名称已从 `"agent"` 更改为 `"model"`，以更好地反映节点的用途。

### Runtime context  运行时上下文

When you invoke an agent, it's often the case that you want to pass two types of data:  
当你调用代理时，通常需要传递两种类型的数据：

* Dynamic state that changes throughout the conversation (e.g., message history)  在整个对话过程中变化的动态状态（例如，消息历史记录）
* Static context that doesn't change during the conversation (e.g., user metadata)  在对话过程中不变的静态上下文（例如，用户元数据）

In v1, static context is supported by setting the `context` parameter to `invoke` and `stream`.  
在 v1 中，通过将 `context` 参数设置为 `invoke` 和 `stream` 来支持静态上下文。

```python 
from dataclasses import dataclass  
  
from langchain.agents import create_agent  
  
@dataclass
class Context:
    user_id: str
    session_id: str  
  
agent = create_agent(
    model=model,
    tools=tools,
    context_schema=Context  
)  
  
result = agent.invoke(
    {"messages": [{"role": "user", "content": "Hello"}]},
    context=Context(user_id="123", session_id="abc")  
)
```  
  
```python 
from langgraph.prebuilt import create_react_agent  
  
agent = create_react_agent(model, tools)  
  
# Pass context via configurable  通过 configurable 传递上下文
result = agent.invoke(
    {"messages": [{"role": "user", "content": "Hello"}]},
    config={  
        "configurable": {  
            "user_id": "123",  
            "session_id": "abc"  
        }  
    }  
)
```


The old `config["configurable"]` pattern still works for backward compatibility, but using the new `context` parameter is recommended for new applications or applications migrating to v1.  
旧的 `config["configurable"]` 模式仍然有效以保持向后兼容性，但对于新应用程序或迁移到 v1 的应用程序，建议使用新的 `context` 参数。




## langfuse配置

导入修改
```python
#old
from langfuse.callback import CallbackHandler
#new
from langfuse.langchain import CallbackHandler
```
修改初始化
```python
#old
handler = CallbackHandler(
            public_key=public_key,
            secret_key=secret_key,
            host=host,
            httpx_client=httpx.Client(verify=False),
        )

#new
handler = CallbackHandler()
```