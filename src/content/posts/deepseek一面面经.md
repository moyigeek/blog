---
title: deepseek一面面经
date: 2026-7-15 23:11:26
tags:
  - resume
---
岗位:服务端开发工程师
面试官说了一面主要考基础，不问项目

## 1.思考题
### a.已知整数n 有个序列\[1,n],去掉其中一个，并随机打乱，怎样最快找到n-1个数字中缺少的那一个

将\[1,n]与n-1个数字连续异或

### b.你知道冒泡排序吧，那在a\<b交换的时候，改成50%概率，这样冒泡流程完成产生的序列时候是否等概率的
否，数组长度为n,n=2时等概率的，n=3时，$A_{3}^{3}=6$ 种组合，假设是等概率的，即每种组合为1/6,但是每一次从序列a->b的概率为1/8，因为有重复的可能,所以为m/8，m为正整数，与假设不服

### c.是否存在p，使得冒泡排序时p概率交换产生的序列是等概率的
n=2时，序列概率分别为p,1-p,当等概率时，p=1/2,由b可以知道，在这个p下对于n=3是不等的，所以不存在p满足条件。
> 面试官说这不是预期的答案，但这个回答也是对的


## 2.八股文
### go和rust异步有什么差别
goroutine，gmp
rust tokio，异步状态机
### goruntine异步怎么实现的，为什么不用await
epoll gmp 阻塞，协程调度

### rust的安全模型或者安全承诺
生命周期确保引用的存活时间绝对不能长于数据的存活时间
借用保证多线程/多作用域下不会出现写时读
所有权确保不会多次释放

## 3.编程题

1. 压缩字符串[443. 压缩字符串 - 力扣（LeetCode）](https://leetcode.cn/problems/string-compression/description/) 
```cpp
#include<iostream>
#include<string>

using namespace std;

string compress(string &s){
    if(s.empty())return "";
 
    string result; 
    int count=1;

    for (size_t i=1;i<s.size();++i){
        if(s[i]==s[i-1]){
            count++;
        }else{
            result+=s[i-1];
            result+=to_string(count);
            count=1;
        }
    }

    result +=s.back();
    if(count!=1){
        result+=to_string(count);
    }
    return result;
}

int main(){
    string input;
    cin>>input;
    cout<<compress(input)<<endl;
}
```
2. 将压缩字符串改成类，实现push,get_compress并支持流式
```cpp
#include <iostream>
#include <string>

using namespace std;

class Compress
{
private:
    string completed;
    char cur_char;
    int count;
    bool has_date;

public:
    Compress() : cur_char('\0'), count(0), has_date(false) {}

    void push(char c){
        if(!has_date){
            has_date=true;
            count=1;
            cur_char=c;
            return;
        }
        if(c==cur_char){
            count++;
        }else{
            completed+=cur_char;
            if(count>1){
                completed+=to_string(count);
            }
            cur_char=c;
            count=1;
        }
    }

    void push(string &s){
        for(char c:s){
            push(c);
        }
    }

    string get_compress(){
        string res=completed;
        // cout<<res;
        if(has_date){
            res+=cur_char;
            if(count>1){
                res+=to_string(count);
            }
        }
        return res;
    }
        
};

int main(){
    Compress comp1;
    string input;
    cin>>input;
    comp1.push(input);
    cin>>input;
    comp1.push(input);
    cout<<comp1.get_compress()<<endl;
}
```