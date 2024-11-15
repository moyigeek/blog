---
title: 2024A-rcore-camp-stag3-moyigeek
date: 2024-11-13 18:52:50
tags:
    - rcore
---
### 内核组件化设计

1. 面向场景和应用需求构建内核
2. 以统一的视角看待不同规模的内核
    规模较大的内核，可以视为在规模较小的内核基础上增量构造。宏内核,hypervisor等复杂模式可以看作特殊的UniKernel

优势:
1. 提高内核开发效率
    组件时良好封装的功能单元，直接通过接口调用。
2. 降低内核维护难度
3. 开展基于组件的功能复用和开发协助

###  概念
-  内核系统
    - 运行在内核太的软件，向下与硬件交互，向上提供服务
-  内核组件
    - 用于构建内核系统的基本元素，最小可部署单元。组件可以独立构建和分发，不能独立运行
### 区别
应用与内核
UniKernel:
(1)处于同一特权级-内核态
(2)共享同一地址空间-相互可见。
(3)编译形成一个Image，一体运行
(4)Unikernel既是应用又是内核是二者合体
其他：
(1)分别在独立的相互隔离特权级运行
(2)分别在用户地址空间和内核地址空间-相互独立
(3)分别是不同的lmage，构造和运行相互独立
(4)内核和应用之间的界限分明，以系统调用等ABI为界

### 思路
{% asset_img exp_path.png 实验思路 %}
通过在unikernel中添加组件实现宏内核(用户特权级和地址空间隔离运行应用，应用和内核之间受控的通信机制)，hypervisor(多个操作系统共享硬件资源，通过虚拟化技术实现).

### 实验
**UNIKERNEL**
U.1 Hello字符终端输出信息

U.2 Collections动态内存分配

U.3 ReadPFlash地址空间重映射

U.4 ChildTask多任务与协作式调度

U.5 MsgQueue任务间互斥与通信

U.6 FairSched时钟与抢占式调度

U.7 ReadBlock块设备驱动

U.8 LoadApp文件系统

**宏内核**
1. UserPrivilege用户特权级
2. UserAspace用户地址空间
3. Process进程管理

**Hypervisor**
1. VirtualMode虚拟化
2. GuestSPace
3. Vmexit

### U.1.0 Helloworld
核心组件：裸机程序=>层次化重构=》组件化重构

基于feature选择必要组件的最小组件集合。
```
make run A=tour/u_1_0
```


### U.2.0 Collections
1. 引入动态内存分配组件，支持Rust Collections类型
2. 动态内存分配的框架和算法
```
make run A=tour/u_2_0
```
Rust Collections类型需要动态内存分配支持，内核开发时没有内存管理，只能自己实现global_alloctor适配自身的内存管理子系统


接口
Bytes Alloc 
- Rust Trait #[flobal_alloocator]
Page Alloc
- Globa Functor *global_allocator()*
框架
axalloc
算法
allocator
- TlsfByteAllocator
- BuddyByteAllocator
- SlabByteAllocator
- BitmapByteAllocator


[support hashmap]:支持HashMap类型
要求:
1.在axstd等组件中，支持collections::HashMap
2.再次执行make run A=exercises/support_hashmap
提示:
1.报错的std其实是axstd，测试用例main.rs中有"extern crate axstd as std;"
2.在axhal中给出了一个随机数产生函数random()，可以基于它为HashMap提高随机数支持（在axhal 和 axstd 之间还有axapi层）