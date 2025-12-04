---
title: crawl4ai 使用记录
date: 2025-11-20 16:07:46
tags:
- author:moyigeek
- network
- mcp
---

文档[Crawler Result - Crawl4AI Documentation (v0.7.x)](https://docs.crawl4ai.com/core/crawler-result/)

### 部署
```shell
pip install -U crawl4ai
pip install nest_asyncio
```

安装浏览器内核
```bash
playwright install
```
补全缺少的库(ubuntu)
```bash
sudo apt update && sudo apt install -y \
  libicu66 \
  libxml2 \
  libwebp6 \
  libffi7
```
arch
```bash
yay -S icu66  libxml2-2.9  libwebp6  libffi7
```
修改有头模式
```python
browser_conf = BrowserConfig(headless=False)
async with AsyncWebCrawler(config=browser_conf) as crawler:
```
获取requset_header，需要配置
```python
config = CrawlerRunConfig(
        capture_network_requests=True,
        capture_console_messages=True
    )
```
区分api_call
```python
api_calls = [r for r in result.network_requests 
                            if r.get("event_type") == "request" and "api" in r.get("url", "")]
                if api_calls:
                    print(f"Detected {len(api_calls)} API calls:")
                    for call in api_calls[:3]:  # Show first 3
                        print(f"  - {call.get('method')} {call.get('url')}")
```

获取response_headers，不需要配置
```python
print(f"{result.response_headers}")
```
拿到的是当前页面的response
```python
import asyncio
import json
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig,BrowserConfig

async def main():
    browser_conf = BrowserConfig(headless=False)
    # Enable both network request capture and console message capture
    config = CrawlerRunConfig(
        capture_network_requests=True,
        capture_console_messages=True
    )

    async with AsyncWebCrawler(config=browser_conf) as crawler:
        result = await crawler.arun(
            url="https://bing.com",
            config=config
        )

        if result.success:
            # Analyze network requests
            if result.network_requests:
                print(f"Captured {len(result.network_requests)} network events")

                # Count request types
                request_count = len([r for r in result.network_requests if r.get("event_type") == "request"])
                response_count = len([r for r in result.network_requests if r.get("event_type") == "response"])
                failed_count = len([r for r in result.network_requests if r.get("event_type") == "request_failed"])

                print(f"Requests: {request_count}, Responses: {response_count}, Failed: {failed_count}")

                # Find API calls
                api_calls = [r for r in result.network_requests 
                            if r.get("event_type") == "request" and "api" in r.get("url", "")]
                if api_calls:
                    print(f"Detected {len(api_calls)} API calls:")
                    for call in api_calls[:3]:  # Show first 3
                        print(f"  - {call.get('method')} {call.get('url')}")

            # Analyze console messages
            if result.console_messages:
                print(f"Captured {len(result.console_messages)} console messages")

                # Group by type
                message_types = {}
                for msg in result.console_messages:
                    msg_type = msg.get("type", "unknown")
                    message_types[msg_type] = message_types.get(msg_type, 0) + 1

                print("Message types:", message_types)

                # Show errors (often the most important)
                errors = [msg for msg in result.console_messages if msg.get("type") == "error"]
                if errors:
                    print(f"Found {len(errors)} console errors:")
                    for err in errors[:2]:  # Show first 2
                        print(f"  - {err.get('text', '')[:100]}")

            # Export all captured data to a file for detailed analysis
            with open("network_capture.json", "w") as f:
                json.dump({
                    "url": result.url,
                    "network_requests": result.network_requests or [],
                    "console_messages": result.console_messages or []
                }, f, indent=2)

            print("Exported detailed capture data to network_capture.json")

if __name__ == "__main__":
    asyncio.run(main())

```
![[Pasted image 20251015183928.png]]
能成功打开网页并导航到网站并输出请求体
![[Pasted image 20251015184116.png]]
LLM配置用于过滤内容生成md，如果需要LLM指导爬虫，可以配置LLM，但我们需要的是api和路径，可以选择不生成md。

### 编写mcp工具
由于爬虫花的时间较长，设置了两个工具避免超时，下面是效果图，先使用start_crawl创建爬虫任务，然后使用get_crawl_resul查询执行结果


![[Pasted image 20251016115935.png]]

```python

mcp = FastMCP()

# ---------- 内存任务存储 ----------
TASK_TTL = timedelta(minutes=10)  # 10 分钟自动清理过期任务

_task_store: Dict[str, Dict] = {}  # {task_id: {...}}
_gc_task = None  # 全局变量存储垃圾回收任务


# ---------- 后台爬取逻辑 ----------
async def _crawl_task(task_id: str, url: str) -> None:
    """
    在后台执行真正的 crawl4ai 抓取，完成后写入 task_store。
    任何异常都会被捕获并标记为 failed。
    """
    try:
        browser_conf = BrowserConfig(
            headless=False,
        )
        run_conf = CrawlerRunConfig(
            capture_network_requests=True,
            # wait_for="domcontentloaded",  # 不等所有图片加载完
            # page_timeout=30_000,  # 10 秒超时
            # delay_before_return_html=0,
        )

        async with AsyncWebCrawler(config=browser_conf) as crawler:
            result = await crawler.arun(url=url, config=run_conf)

        # 统计
        net = result.network_requests or []
        req_cnt = sum(1 for r in net if r.get("event_type") == "request")
        resp_cnt = sum(1 for r in net if r.get("event_type") == "response")
        fail_cnt = sum(1 for r in net if r.get("event_type") == "request_failed")

        _task_store[task_id] = {
            "status": "completed",
            "result": {
                "url": result.url,
                "network_requests": net,
                "total_requests": req_cnt,
                "total_responses": resp_cnt,
                "total_failed": fail_cnt,
            },
            "created_at": datetime.now(timezone.utc),
        }
    except Exception as exc:
        _task_store[task_id] = {
            "status": "failed",
            "result": {"error": str(exc)},
            "created_at": datetime.now(timezone.utc),
        }


# ---------- 定期清理过期任务 ----------
async def _gc_tasks() -> None:
    while True:
        await asyncio.sleep(60)  # 每分钟扫一次
        cutoff = datetime.now(timezone.utc) - TASK_TTL
        to_del = [tid for tid, t in _task_store.items() if t["created_at"] < cutoff]
        for tid in to_del:
            _task_store.pop(tid, None)


# ---------- MCP Tools ----------
@mcp.tool("start_crawl")
async def start_crawl(
    url: str = Field(description="要爬取的网址"),
) -> str:
    """
    启动异步爬取任务，立即返回 task_id，供后续轮询。
    """
    # 启动垃圾回收任务（如果还没有启动）
    global _gc_task
    if _gc_task is None:
        _gc_task = asyncio.create_task(_gc_tasks())

    task_id = str(uuid.uuid4())
    _task_store[task_id] = {
        "status": "running",
        "created_at": datetime.now(timezone.utc),
    }
    # 后台执行
    asyncio.create_task(_crawl_task(task_id, url))
    return task_id


@mcp.tool("get_crawl_result")
async def get_crawl_result(
    task_id: str = Field(description="start_crawl 返回的任务 ID"),
) -> Dict:
    """
    查询任务状态与结果。
    返回示例
    {
      "status": "running" | "completed" | "failed" | "not_found",
      "result": <具体数据或错误信息>
    }
    """
    task = _task_store.get(task_id)
    if not task:
        return {"status": "not_found"}
    # 仅返回必要字段，避免 MCP 消息过大
    return {"status": task["status"], "result": task.get("result")}


# ---------- 启动入口 ----------
def main():
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()

```