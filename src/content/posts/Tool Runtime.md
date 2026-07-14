---
title: Tool Runtime
date: 2026-03-17 08:27:46
tags:
- author:moyigeek
- linux
- shell
---
# Tool Runtime

**在 LangGraph 中使用 `ToolNode` 执行工具时，通过 `InjectedState` 注解访问当前 graph state 中的字段，如 `task_plan`、`task_index` 等。**

`ToolNode` 是执行工具的标准方式，它自动将当前 state 注入到工具函数中。工具函数签名添加 `state: Annotated[AibotState, InjectedState]` 参数即可读取 state（只读），不会暴露给 LLM。

```python
from typing_extensions import Annotated
from langgraph.prebuilt import ToolNode, InjectedState
from langchain_core.tools import tool
from langchain_core.messages import ToolMessage
from typing import Sequence
from langchain_core.messages import BaseMessage

# 示例工具：访问 state 中的 task_plan 和 task_index
@tool
def my_tool(
    query: str,
    state: Annotated[AibotState, InjectedState]  # 注入当前 state，只读
) -> str:
    """示例工具，需要访问 state 中的 task_plan 和 task_index"""
    # 直接访问 state 字段
    current_index = state["task_index"]
    plan = state["task_plan"]
    task = plan.get(current_index, "No task")
    
    return f"Processed '{query}' for task {current_index}: {task}"

# 在 graph_builder 中添加工具节点
tools = [my_tool]  # 你的工具列表
tool_node = ToolNode(tools)  # 自动注入 state

graph_builder.add_node(NodeName.EXECUTOR, tool_node)  # 或你的工具节点名
```



**关键点：**

- `InjectedState` 确保 `state` 参数不暴露在工具 schema 中，LLM 只看到 `query`
- `ToolNode(tools)` 自动处理工具调用、并行执行、错误处理
- 在 executor_node 中使用 `tool_node`，LLM 通过 `bind_tools(tools)` 看到工具描述
- 读取 state 是只读的；要更新 state，返回 `Command(update={"field": value})`

**工具`get_sandbox_status`只看到`['messages']`是因为`create_agent`默认使用标准`AgentState`，它只包含`messages`字段，而忽略了自定义`AibotState`。**

`create_agent`需要显式指定`state_schema=AibotState`才能让代理和工具访问完整自定义state，包括`user_question`、`token_usage`等字段。