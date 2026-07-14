---
title: arceos Hello world
date: 2026-4-16 12:22:59
tags:
    - author:moyigeek
---


# arceos Hello world

## 实验环境

- lenovo Y7000p 2021

- archlinux
- linux kernel 6.19-rc1

##  dependency

安装rust和qemu

```
sudo pacman -S rustup
sudo pacman -S qemu-system-riscv
```

由于arceos需要实验性参数，安装nightly版本,下面是没nightly的报错

```shell
arceos main ❯ make A=examples/helloworld ARCH=riscv64 LOG=info
axconfig-gen configs/defconfig.toml /home/moyi/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/axplat-riscv64-qemu-virt-0.4.1/axconfig.toml  -w arch=riscv64 -w platform=riscv64-qemu-virt -o "/home/moyi/wd/chenlong/arceos/.axconfig.toml"
    Building App: helloworld, Arch: riscv64, Platform: riscv64-qemu-virt, App type: rust
cargo -C examples/helloworld build -Z unstable-options --target riscv64gc-unknown-none-elf --target-dir /home/moyi/wd/chenlong/arceos/target --release  --features "axstd/defplat axstd/log-level-info"
error: the `-C` flag is unstable, pass `-Z unstable-options` on the nightly channel to enable it
make: *** [scripts/make/build.mk:43: _cargo_build] Error 101
```

安装nightly

```shell
rustup install nightly
# 如果有多个版本要优先nightly
rustup override set nightly
```

安装依赖

```
cargo install cargo-binutils axconfig-gen cargo-axplat
```

将.cargo/bin加入PATH因为要执行axconfig-gen来生成平台配置文件，包括内存地址之类的，不然会

```shell
arceos main ❯ make PLATFORM=riscv64-qemu-virt A=examples/helloworld LOG=info
Installing axconfig-gen...
    Updating crates.io index
     Ignored package `axconfig-gen v0.2.1` is already installed, use --force to override
warning: be sure to add `/home/moyi/.cargo/bin` to your PATH to be able to run the installed binaries
scripts/make/platform.mk:39: *** PLAT_CONFIG=/home/moyi/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/axplat-x86-pc-0.4.1/axconfig.toml is not a valid platform configuration file.  Stop.
```







## 运行

```
make A=examples/helloworld ARCH=riscv64 LOG=info
```

![PCB](/images/posts/arce-helloworld/arcehelloworld.png)
