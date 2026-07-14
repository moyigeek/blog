---
title: 2024A-rcore-camp-stag4-moyigeek
date: 2024-12-19 21:10:24
tags:
---

​`#[repr(c)]`​以c的数据

```rust
#[repr(C)]
pub(super) struct Cell<T: Future, S> {
    /// Hot task state data
    pub(super) header: Header,

    /// Either the future or output, depending on the execution stage.
    pub(super) core: Core<T, S>,

    /// Cold data
    pub(super) trailer: Trailer,
}
```

​`pub(in path) 使一个程序项在提供的 path 中可见。path 必须是声明其可见性的程序项的祖先模块。
pub(crate) 使一个程序项在当前 crate 中可见。
pub(super) 使一个程序项对父模块可见。这相当于 pub(in super)。
pub(self) 使一个程序项对当前模块可见。这相当于 pub(in self) 或者根本不使用 pub。`​

‍

一个 *future* 代表一个可能还没有可用的值。 这可能是，例如，由另一个任务计算的整数或从网络下载的文件。 与等待值可用不同，future 使得可以继续执行直到需要值

‍

方法 poll 接受两个参数：self： Pin<&mut Self> 和 cx： &mut Context。 前者的行为与普通的 &mut self 引用类似，只是 Self 值被 钉住 pinned 在它的内存位置。 在理解 async/await 是如何工作之前，理解 Pin 以及为什么它是必要的是困难的。 因此，我们将在本文后面解释它。

参数 cx： &mut Context 的目的是将一个 唤醒器 Waker 实例传递给异步任务，例如文件系统加载。 这个 Waker 允许异步任务发出信号，表明它（或它的一部分）已经完成，例如文件已经从磁盘加载完毕。 由于主任务知道当 Future 可用时它将被通知，所以它不需要一遍又一遍地调用 poll。 我们将在本文后面实现自己的 Waker 类型时更详细地解释这个过程。

自引用结构体的内部指针导致了一个基本问题，当我们观察它们的内存布局时就会变得明显：

​`array`​ 字段从地址 `0x10014`​ 开始，`element`​ 字段从地址 `0x10020`​ 开始。 它指向地址 `0x1001c`​，因为最后一个数组元素位于这个地址。 在这一点上，一切都还好。 然而，当我们将这个结构体移动到不同的内存地址时，问题就出现了：

我们移动了结构体，使它现在从地址 `0x10024`​ 开始。 这可能发生在我们将结构体作为函数参数传递或将它赋值给不同的栈变量时。 问题在于 `element`​ 字段仍然指向地址 `0x1001c`​，即使最后一个 `array`​ 元素现在位于地址 `0x1002c`​。 因此，指针是悬空的，这导致下一个`poll`​调用时发生未定义的行为。

#### 可能的解决方案

 有三个基本方法来解决悬空指针问题：

* 在移动时更新指针： 这个方法的想法是在结构体在内存中移动时更新内部指针，以便它在移动后仍然有效。 不幸的是，这种方法需要对Rust进行大量的更改，这可能导致巨大的性能损失。 原因是某种类型的运行时需要跟踪所有结构体字段的类型，并在每次移动操作时检查是否需要更新指针。
* 存储偏移量而不是自引用： 为了避免更新指针的要求，编译器可以尝试将自引用存储为结构体开始的偏移量。 例如，上面的WaitingOnWriteState结构体的element字段可以以element_offset字段的形式存储，其值为8，因为引用的数组元素在结构体开始的8字节后开始。 由于结构体移动时偏移量保持不变，因此不需要进行字段更新。  
  这个方法的问题在于它需要编译器检测所有的自引用。 这在编译时是不可能的，因为引用的值可能取决于用户输入，所以我们需要一个运行时系统来分析引用并正确地创建状态结构体。 这不仅会导致运行时成本，还会阻止某些编译器优化，这将导致大量的性能损失。
* 禁止移动结构体： 正如我们上面看到的，悬空指针只有在我们移动结构体时才会出现。 通过完全禁止对自引用结构体的移动操作，问题也可以避免。 这种方法的巨大优势在于它可以在类型系统级别实现而不需要额外的运行时成本。 缺点是它将 可能的自引用结构体的移动操作的处理负担 放在了程序员身上。

Rust 选择了第三种解决方案，因为它的原则是提供 零成本抽象，这意味着抽象不应该带来额外的运行时成本。 钉住 pinning API 是为此目的而提出的，它在 RFC 2349。 在接下来的内容中，我们将简要介绍这个 API，并解释它如何与 async/await 和 futures 一起工作。

#### 堆上之数值

第一个观察是， 堆分配的 heap-allocated 值大多数情况下已经有一个固定的内存地址。 它们是通过调用 allocate 函数创建的，然后通过指针类型（如 Box<T>）引用。 虽然移动指针类型是可能的，但指针指向的堆值保持在相同的内存地址，直到它再次通过 deallocate 调用被释放。

```rust
fn main() {
    let mut heap_value = Box::new(SelfReferential {
        self_ptr: 0 as *const _,
    });
    let ptr = &*heap_value as *const SelfReferential;
    heap_value.self_ptr = ptr;
    println!("heap value at: {:p}", heap_value);
    println!("internal reference: {:p}", heap_value.self_ptr);
}

struct SelfReferential {
    self_ptr: *const Self,
}
```

#### Pin<Ox<T>> 并取消 pin

钉住 pinning API 提供了一个对 &mut T 问题的解决方案，即 Pin 包装类型和 Unpin 标记特型 trait。 这些类型后面的想法是，在 Pin 的所有方法上设置门槛，这些方法可以用来获得对包装值的 &mut 引用（例如 get_mut 或 deref_mut），这些门槛是 Unpin 特型。 Unpin 特型是一个 auto trait，Rust 自动为所有类型实现了它，除了那些明确地选择了不实现的类型。 通过使自引用结构体选择不实现Unpin的类型，对于它们来说，要从Pin<Box<T>>类型获得 &mut T是没有（安全的）的办法的。

#### 栈上钉住和 Pin<&mut T>

前一节中，我们学习了如何使用 `Pin<Box<T>>`​ 安全地创建堆分配的自引用值。 虽然这种方法运行良好并且相对安全（除了不安全的构造），但所需的堆分配会带来性能成本。 由于Rust力求在可能的情况下提供*零成本抽象*，钉住 pinning API 也允许创建指向栈分配值的 `Pin<&mut T>`​ 实例。

该方法带有 `self： Pin<&mut Self>`​ 而不是普通的 `&mut self`​ 的原因是，从 async/await 创建的 future 实例通常是自引用的，正如我们 [上面](https://os.phil-opp.com/zh-TW/async-await/#self-referential-structs) 所看到的。 通过将`Self`​包装到 `Pin`​ 中，并让编译器为从 async/await 生成的自引用 future 选择不实现 `Unpin`​，可以保证在 `poll`​ 调用之间不会在内存中移动 future。 这确保了所有内部引用仍然有效。值得注意的是，在第一次`poll`​调用之前移动 future 是没问题的。 这是因为 future 是惰性的，直到第一次被轮询之前它们不会做任何事情。 生成的状态机的 `start`​ 状态因此只包含函数参数，而没有内部引用。 为了调用 `poll`​，调用者必须首先将 future 包装到 `Pin`​ 中， 这确保了 future 在内存中不会再被移动。 由于 栈上 钉住操作 更难正确使用，我建议总是使用[`Box：:p in`](https://doc.rust-lang.org/nightly/alloc/boxed/struct.Box.html#method.pin)​结合[`Pin：：as\_mut`](https://doc.rust-lang.org/nightly/core/pin/struct.Pin.html#method.as_mut)​来实现。

### 执行器和唤醒器

使用 async/await，我们可以使用完全异步的方式舒适地使用 futures。 然而，正如我们上面所学到的，futures 在被轮询之前不会做任何事情。 这意味着我们必须在某个时候调用 poll，否则异步代码永远不会被执行。

#### 运行器 Executors

执行器的目的是允许将 future 作为独立任务进行生成，通常通过某种 spawn 方法。 然后执行器负责轮询所有 future 直到它们完成。 管理所有 future 的一个重要优势是，当 future 返回 Poll：:P ending 时，执行器可以切换到另一个 future。 因此，异步操作是并行运行的，并且 CPU 保持忙碌。

许多执行器的实现也可以利用具有多个CPU核心的系统。 它们创建了一个 线程池 thread pool，如果有足够的工作可用， 它可以利用所有核心，并使用诸如 work stealing 之类的技术来平衡核心之间的负载。 还有一些针对嵌入式系统的特殊执行器实现，它们优化了低延迟和内存开销。

为了避免重复轮询 future 的开销，执行器通常利用 Rust 的 futures 支持的 唤醒器 waker API。

#### 唤醒器 Wakers

唤醒器API的想法是，一个特殊的Waker类型被传递给每个poll调用，它被包装在Context类型中。 这个 Waker 类型是由执行器创建的，可以被异步任务用来通知它的（部分）完成。 因此，执行器不需要在之前返回 Poll：:P ending 的 future 上调用 poll，直到它被相应的唤醒器通知。

##### `RawWaker`​

类型 RawWaker 要求程序员明确地定义一个 virtual method table （vtable），它指定了在 RawWaker 被克隆、唤醒或丢弃时应该调用的函数。 这个 vtable 的布局由 RawWakerVTable 类型定义。 每个函数接收一个 *const （） 参数，这是一个对某个值的 type-erased 指针。 使用 *const （） 指针而不是正确的引用的原因是，RawWaker 类型应该是非泛型的，但仍然支持任意类型。 通过将它放入RawWaker：：new的data参数中提供，这个函数只是初始化了一个RawWaker。 然后 Waker 使用这个 RawWaker 来使用 data 调用 vtable 函数。

通常，RawWaker 是为一些堆分配的结构体创建的，它被包装到 Box 或 Arc 类型中。 对于这样的类型，可以使用 Box：into_raw 这样的方法将 Box<T> 转换为 *const T 指针。 然后可以将这个指针转换为匿名的 *const （） 指针并传递给 RawWaker：：new。 由于每个 vtable 函数都接收相同的 *const （） 作为参数，所以函数可以安全地将指针转换回 Box<T> 或 &T 来操作它。 正如你所预料的，这个过程是非常危险的，并且很容易在出错时导致未定义的行为。 因此，除非必要，否则不建议手动创建RawWaker。

通常，`RawWaker`​ 是为一些堆分配的结构体创建的，它被包装到 [`Box`](https://doc.rust-lang.org/stable/alloc/boxed/struct.Box.html)​ 或 [`Arc`](https://doc.rust-lang.org/stable/alloc/sync/struct.Arc.html)​ 类型中。 对于这样的类型，可以使用 [`Box：into\_raw`](https://doc.rust-lang.org/stable/alloc/boxed/struct.Box.html#method.into_raw)​ 这样的方法将 `Box<T>`​ 转换为 `*const T`​ 指针。 然后可以将这个指针转换为匿名的 `*const （）`​ 指针并传递给 `RawWaker：：new`​。 由于每个 vtable 函数都接收相同的 `*const （）`​ 作为参数，所以函数可以安全地将指针转换回 `Box<T>`​ 或 `&T`​ 来操作它。 正如你所预料的，这个过程是非常危险的，并且很容易在出错时导致未定义的行为。 因此，除非必要，否则不建议手动创建`RawWaker`​。

##### The `Stream`​ Trait

由于产生多个异步值的类型很常见，futures crate 提供了一种对这类型的有用抽象：Stream trait。 该 特型 trait 的定义如下：

```rust
pub trait Stream {
    type Item;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context)
        -> Poll<Option<Self::Item>>;
}
```

### io-uring

与 epoll 不同，io-uring 不是一个事件通知机制，它是一个真正的异步 syscall 机制。你并不需要在它通知后再手动 syscall，因为它已经帮你做好了。

io-uring 主要由两个 ring 组成（SQ 和 CQ），SQ 用于提交任务，CQ 用于接收任务的完成通知。任务（Op）往往可以对应到一个 syscall（如 read 对应 ReadOp），也会指定这次 syscall 的参数和 flag 等。

在 submit 时，内核会消费掉所有 SQE，并注册 callback。之后等有数据时，如网卡中断发生，数据通过驱动读入，内核就会触发这些 callback，做 Op 想做的事情，如拷贝某个 fd 的数据到 buffer（这个 buffer 是用户指定的 buffer）。相比 epoll，io-uring 是纯同步的。


总结一下，io-uring 和 epoll 在使用上其实差不多，一般使用方式是：直接将想做的事情丢到 SQ 中（如果 SQ 满了就要先 submit 一下），然后在没事干（所有任务都卡在 IO 了）的时候 `submit_and_wait(1)`​（`submit_and_wait`​ 和 `submit`​ 并不是 syscall，它们是 liburing 对 `enter`​ 的封装）；返回后消费 CQ，即可拿到 syscall 结果。如果你比较在意延迟，你可以更激进地做 `submit`​，尽早将任务推入可以在数据 ready 后尽早返回，但与此同时也要付出 syscall 增多的代价。

### 有栈协程

如果我们能在用户代码和最终产物之间插入一些逻辑呢？像 Golang 那样，用户代码实际上只对应到可被调度的 goroutine，实际拥有线程控制权的是 go runtime。goroutine 可以被 runtime 调度，在执行过程中也可以被抢占。

当 goroutine 需要被中断然后切换到另一个 goroutine 时，runtime 只需要修改当前的 stack frame 即可。每个 goroutine 对应的栈其实是存在堆上的，所以可以随时打断随时复原。

网络库也是配合这一套 runtime 的。syscall 都是非阻塞的，并可以自动地挂在 netpoll 上。

有栈协程配合 runtime，解耦了 Task 级的用户代码和线程的对应关系。

### 基于 Future 的无栈协程

有栈协程的上下文切换开销不可忽视。因为可以被随时打断，所以我们有必要保存当时的寄存器上下文，否则恢复回去时就不能还原现场了。

无栈协程没有这个问题，这种模式非常符合 Rust 的 Zero Cost Abstraction 的理念。Rust 中的 `async + await`​ 本质上是代码的自动展开，`async + await`​ 代码会基于 llvm generator 自动展开成状态机，状态机实现 Future 通过 poll 和 runtime 交互（具体细节可以参考[这篇文章](https://hsqstephenzhang.github.io/2021/11/24/rust/futures/future-explained0/)）。


每个 io\_uring 实例都有**==两个环形队列==**（ring），在内核和应用程序之间共享：

* **==提交队列==**：submission queue (SQ)
* **==完成队列==**：completion queue (CQ)

​![](https://arthurchiao.art/assets/img/intro-to-io-uring/io_uring.png)​

这两个队列：

* 都是**==单生产者、单消费者==**，size 是 2 的幂次；
* 提供**==无锁接口==**（lock-less access interface），内部使用 **==内存屏障==**做同步（coordinated with memory barriers）。

**==使用方式==**：

* 请求

  * 应用创建 SQ entries (SQE)，更新 SQ tail；
  * 内核消费 SQE，更新 SQ head。
* 完成

  * 内核为完成的一个或多个请求创建 CQ entries (CQE)，更新 CQ tail；
  * 应用消费 CQE，更新 CQ head。
  * 完成事件（completion events）可能以任意顺序到达，到总是与特定的 SQE 相关联的。
  * 消费 CQE 过程无需切换到内核态。
