---
title: mini-firewall
date: 2024-11-20 22:07:46
tags:
- author:moyigeek
- network
---

## Mini Firewall

### 测试环节
创建docker 网络
```bash
sudo docker network create --subnet=192.168.1.0/24 net1
sudo docker network create --subnet=192.168.2.0/24 net2
```

创建docker
```bash
sudo docker run -it --name container1 --network net1 --ip 192.168.1.10 ubuntu:20.04
sudo docker run -it --name container2 --network net2 --ip 192.168.2.10 ubuntu:20.04
```

创建路由
```bash
docker exec container1 ip route add 192.168.2.0/24 via 192.168.1.1
```

