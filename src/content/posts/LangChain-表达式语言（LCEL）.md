---
title: LangChain 表达式语言（LCEL）
date: 2026-03-14 13:07:46
tags:
- author:moyigeek
- langchain
- ai agent
---
# LangChain 表达式语言（LCEL） -

---
LCEL（LangChain表达式语言）用于通过“管道”符号（|）连接提示、模型、数据检索器和解析器等人工智能构建模块，使信息从一个部分顺畅地流向另一个部分。我们不需要写复杂的代码，而是按照需要的顺序堆叠这些块，LCEL确保每一步的输出传递到下一个。它旨在帮助开发者快速构建AI应用，保持代码的简洁模块化，并利用并行处理和便捷调试等功能。

-   **可运行接口：**LCEL 的核心是可运行组件，模块化组件封装功能或作，可链式连接。任意两个可跑的可运行者都可以通过管道 |通过过载\_\_or\_\_方法，形成数据流，使一个组件的输出成为下一个组件的输入。
-   **声明链：**通过使用管道作符，LCEL 构建链的方式不同于传统 LangChain 对象，提升了可读性和开发者体验。



## LCEL 的主要特点

让我们看看LCEL的关键特征，

-   **使用管道运算子的声明式语法**：链通过连接 Runnables 与 pipe |作符构建，形成清晰的从左到右的数据流。
-   **并行执行**：支持使用RunnableParallel并发执行独立任务，降低端到端延迟。
-   **保证异步支持**：所有链默认异步运行，支持高吞吐量的使用场景，如网页服务器。
-   **流式输出**：支持增量流式流，加快语言模型的首次令牌发送时间，提升响应性。
-   **LangServe 无缝部署**：链可直接部署到生产环境中，支持重试、备份和扩展。

## LCEL 语法

使用 LCEL 时，我们用管道作符（|）而不是链对象来创建链。一个基本的LLM链由以下三个组成部分组成，可以有许多变体，稍后我们将学习。

-   **LLM**：基于Langchain范式的抽象，用于创建Claude、OpenAI GPT3.5等补全程序。
-   **提示词**：LLM对象以此为输入，向LLM提供查询并指定目标。它基本上是一个字符串模板，我们用变量的某些占位符定义它。
-   **输出解析器**：解析器定义如何从响应中提取输出并显示为最终响应。
-   **链**：链连接上述所有组件。它是对[LLM](https://www.geeksforgeeks.org/artificial-intelligence/large-language-model-llm/)或数据处理过程中任何阶段的一系列调用。

**例如：**

<!-- 图片暂缺：LCEL 链示例 -->

LCEL 链示例

## 使用 LCEL 的简单大型语言模型链

LangChain表达式语言（LCEL）使得以清晰易读的方式构建链变得简单。在这个例子中，我们将使用Cohere的LLM创建一个简单的链条，逐步解决一个应用题。

### 步骤1：导入库

我们导入所有必要的库，

-   **PromptTemplate / ChatPromptTemplate**：用于定义发送给模型的提示结构。
-   **BaseModel，字段**：用于结构化输入的工具（这里不直接使用，但对模式验证很有用）。
-   **ChatCohere：**用于与 Cohere 的大型语言模型交互的包装器。
-   **StrOutputParser：**确保LLM输出被解析成纯文本。

```python
from langchain_core.prompts import PromptTemplate 
from langchain_core.prompts import ChatPromptTemplate 
from langchain_core.pydantic_v1 import BaseModel, Field 
from langchain_cohere import ChatCohere 
from langchain.schema.output_parser import StrOutputParser 
from google.colab import userdata 
```

### 步骤2：设置API密钥并初始化LLM

我们需要 Cohere API 密钥，可以通过以下步骤提取，

-   请访问Cohere的官方网站。

-   使用Google账号或GitHub账号登录/注册。

-   成功登录后，我们将被重定向到仪表盘页面，并在那里找到 API KEY 标签。

-   在 API 密钥菜单中，找到并选择新的试验密钥，复制提取后的密钥。

我们将在代码中附加 Cohere API 密钥，并初始化 LLM，

model=“command-r”：Cohere以推理为中心的模型。

-   **温度=0**：使响应具有确定性（随机性较低）。
-   **cohere\_api\_key**：通过 Cohere 的 API 进行认证。

```python
import os 
os.environ["cohere_api_key"] = "your_key_here"  
llm = ChatCohere(model="command-r", temperature=0,cohere_api_key=cohere_api_key)
```

### 步骤4：定义提示模板并设置输出解析器

我们将定义提示模板，

-   创建一个结构化模板，{question} 将被用户输入替换。
-   “让我们一步步思考”这句话促使LLM在回答前先理性推理。

我们会设置输出解析器，将LLM的原始响应转换为简单字符串（移除元数据）。

```python
template = """Question: {question}  Answer: Let's think step by step.""" 
prompt = PromptTemplate.from_template(template) 
output_parser = StrOutputParser() 
```

### 第五步：建立LCEL链

我们使用管道算符（|）构建LCEL链来连接组件：

-   **提示**：格式化用户的问题。
-   **LLM**：处理格式化输入并生成答案。
-   **输出解析器**：提取纯文本输出。

```python
chain = prompt | llm | output_parser 
```

### 第六步：进行测试

我们将运行查询以测试并获取结果，

-   定义一个简单的应用题。
-   通过 .invoke（） 传递给链。
-   LLM应用逐步推理提示并返回答案。
-   最终回复会打印到控制台上。

```python
question = """
I have five apples. I throw two away. I eat one. How many apples do I have left?
"""
response = chain.invoke({"question": question})
print(response)
```

**输出：**

```
You started with five apples, removed two by throwing them away and then consumed one more, which leaves you with two apples.   

So, the final answer is you have **two apples** left.
```

## LangChain中的Runnables接口  

在使用 LangChain 表达式语言（LCEL）时，我们经常需要修改元件间的数值流动方式，甚至转换这些值本身。为此，LangChain 提供了 Runnables 接口。

### Runnables的工作原理

1\. 任意两个可跑的可运行者都可以串联成一个序列。

2\. 一个 Runnables 的 .invoke（） 调用的输出自动成为下一个可运行调用的输入。

3\. 链化可以通过以下方式实现：

-   管道|（简称）
-   .pipe（） 方法（显式形式）。

这使得管道模块化、灵活且易于读取。

### LangChain 中Runnables的类型

**1\. RunnablePassThrough**

-   只需将输入不变地传递给链中的下一个组件。
-   当我们希望在其他地方进行转换时保留原始数据，这非常有用。

**示例：**

```python
from langchain_core.runnables import RunnablePassthrough

passthrough = RunnablePassthrough()

result = passthrough.invoke("Hello, Geek!")
print(result)
```
**输出：**

> Hello, Geek!

**2\. RunnableParallel**

-   并行将输入发送到多个分支。
-   支持同时处理，例如同时向两个不同的大型语言模型或检索器发送相同的查询。

**示例：**

```python
from langchain_core.runnables import RunnableParallel, RunnableLambda

def to_uppercase(x): return x.upper()
def word_count(x): return len(x.split())

uppercase = RunnableLambda(to_uppercase)
count_words = RunnableLambda(word_count)

parallel = RunnableParallel({
    "upper": uppercase,
    "count": count_words
})

result = parallel.invoke("LangChain makes AI development easier")
print(result)
```

**输出：**

> {'upper': 'LANGCHAIN MAKES AI DEVELOPMENT EASIER', 'count': 5}

**3\. Runable Lambda**

-   封装一个 Python 函数并将其转换为可运行文件。
-   这使得自定义逻辑（如文本清理、预处理、格式化）可以作为可运行组件注入链中。

**示例：**

```python
from langchain_core.runnables import RunnableLambda

def add_five(x):
    return x + 5

def multiply_by_two(x):
    return x * 2

add_five = RunnableLambda(add_five)
multiply_by_two = RunnableLambda(multiply_by_two)

chain = add_five | multiply_by_two
chain.invoke(3)
```

**输出：**

> 16

## LCEL的其他特点

LCEL 还有许多其他特性，如异步流批处理。

-   **.invoke（）**：目标是传递输入并接收输出，既不多也不少。
-   **.batch（）**：这比调用三次更快，因为我们希望提供多个输入以获得多个输出，因为它帮我们处理并行化。
-   **.stream（）**： 我们可能会在整个回复完成前就开始打印响应。

让我们看看他们的实现和使用情况，

```python
prompt_str = "You know 1 short line about {topic}?"
prompt = ChatPromptTemplate.from_template(prompt_str)

chain = prompt | llm | output_parser

result_with_invoke = chain.invoke("AI")

result_with_batch = chain.batch(["AI", "LLM", "Vector Database"])
print(result_with_batch)

for chunk in chain.stream("Artificial Intelligence write 5 lines"):
    print(chunk, flush=True, end="")
```



功能输出

## 使用LCEL的优势

-   **简洁性与开发者生产力**：大幅减少模板代码。开发者描述链的作用，而非具体工作原理，从而加快迭代速度。
-   **优化性能**：运行时优化如并行执行和流式流优化提升延迟，使实时应用的工作流程高效。
-   **改进调试和监控**：与LangSmith的集成自动跟踪所有中间步骤和数据流，使排查过程轻松无忧。
-   **灵活性**：适用于多种应用，包括检索增强生成、对话式人工智能、业务自动化等。

## 局限性

-   **线性结构**：LCEL 链通常一步接一步地运行，这使得构建具有动态分支或复杂决策的工作流程变得困难。
-   **复杂状态管理**：跨多轮管理对话或工作流状态较为棘手，需要手动作，增加了代码复杂度。
-   **工具集成挑战**：在LCEL链中使用和协调多个外部工具并不直观，尤其是在工具使用需要动态变化时。
-   **调试与可扩展性问题**：调试长链或嵌套的LCEL链可能较为困难，且其较新设计意味着在复杂生产场景中稳定性和性能可能有所不同。
