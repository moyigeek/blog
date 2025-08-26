---
title: python数据类型
date: 2025-8-25 17:07:46
tags:
- author:moyigeek
- pyhton
---



### 命名
- 变量名只能包含字母，数字和下划线，不能以数字开头
- 不能包含空格
- 不能使用关键字

## 字符串
用引号括起来的都是字符串，允许使用单括号和双括号
### 大小写
- 大小写 `title()` 首字母大写每个单词，不仅是空格，`-`分割的单词也能被识别
- `upper`全部大写`lower`全部小写
### 合并字符串
当使用字面量时，python会自动拼接
```python
hello="Hello ""world!"
print(hello)
```
但对变量则只能使用+号
```python
hello="Hello "
world="World!"
# print(hello world)
print(hello+world)

print(hello "world") 
			^ SyntaxError: invalid syntax
```
### 空白
`\t`制表符
`\n`换行符
``
`rstrip()`删除开头和结尾的额外空白、`lstrip()`删除开头空白，`rstrip()`删除结尾空白

## 数字
### 整数
+，-，\*，/,是可以
\*\*是乘方
str()将数字转变成字符串

## 列表
列表是一系列按特定顺序排列的元素。通过使用\[]来表示列表，并用逗号来分隔其中的元素。
```python
frults = ['apple', 'banana', 'orange']
print(frults)

# ['apple', 'banana', 'orange']
```
索引从0开始，允许使用负数索引，-1是最后一个元素
### 修改元素
```python
frults[1]='berry'
```
### 添加元素
`.append()`将元素附加到列表末尾
`.insert(pos,item)`制定新元素的索引和值
### 删除元素
使用del,需要知道目标元素在列表中的位置
```python
del frults[0]
```
使用`.pop()`在未指定参数的时候，默认弹出列表最后一个元素，并返回这个元素
`.pop(index)`能弹出指定的位置的元素
del 和pop的差别在于是否会返回删除的元素，如果不需要则使用del，否则用pop
删除制定的元素，不知道索引`.remove(item)`
`.remove`只删除第一个匹配的元素。

### 组织列表
永久性排序`.sort()`,反序`.sort(reverse=Ture)`
```python
frults.sort()
print(frults)
frults.sort(reverse=True)
print(frults)
```
临时性排序`sorted()`
反转列表的顺序`.reverse()`
列表长度`len()`

### 遍历列表
```python
for frult in frults:
    print(frult)
```
python使用缩进来划分代码块

### 数字列表
`range（）` 生成一系列数字
```python
for i in range(1,5):
    print(i)
    
1
2
3
4
```
从指定的第一个值开始数，并在到达你指定的第二个值后停止。
将range作为参数传递给list可以生成数字列表,允许第三个参数，为步长
```pyhton
list(range(2，11，2))

# [2,4,6,8,10]
```

统计计算
- `min()`取最小值
- `max()`取最大值
- `sum()`取总和

### 列表解析

将for循环和创建新元素的代码合并成一行
```python
square=[value**2 for value in range(1,11)]
print(square)
# [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

### 切片
指定要使用的第一个元素的索引和最后一个元素的索引加1## 列表
列表是一系列按特定顺序排列的元素。通过使用\[]来表示列表，并用逗号来分隔其中的元素。
```python
frults = ['apple', 'banana', 'orange']
print(frults)

# ['apple', 'banana', 'orange']
```
索引从0开始，允许使用负数索引，-1是最后一个元素
### 修改元素
```python
frults[1]='berry'
```
### 添加元素
`.append()`将元素附加到列表末尾
`.insert(pos,item)`制定新元素的索引和值
### 删除元素
使用del,需要知道目标元素在列表中的位置
```python
del frults[0]
```
使用`.pop()`在未指定参数的时候，默认弹出列表最后一个元素，并返回这个元素
`.pop(index)`能弹出指定的位置的元素
del 和pop的差别在于是否会返回删除的元素，如果不需要则使用del，否则用pop
删除制定的元素，不知道索引`.remove(item)`
`.remove`只删除第一个匹配的元素。

### 组织列表
永久性排序`.sort()`,反序`.sort(reverse=Ture)`
```python
frults.sort()
print(frults)
frults.sort(reverse=True)
print(frults)
```
临时性排序`sorted()`
反转列表的顺序`.reverse()`
列表长度`len()`

### 遍历列表
```python
for frult in frults:
    print(frult)
```
python使用缩进来划分代码块

### 数字列表
`range（）` 生成一系列数字
```python
for i in range(1,5):
    print(i)
    
1
2
3
4
```
从指定的第一个值开始数，并在到达你指定的第二个值后停止。
将range作为参数传递给list可以生成数字列表,允许第三个参数，为步长
```pyhton
list(range(2，11，2))

# [2,4,6,8,10]
```

统计计算
- `min()`取最小值
- `max()`取最大值
- `sum()`取总和

### 列表解析

将for循环和创建新元素的代码合并成一行
```python
square=[value**2 for value in range(1,11)]
print(square)
# [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

### 切片
指定要使用的第一个元素的索引和最后一个元素的索引加1
```python
print(square[0:3])
print(square[2:])
print(square[:4])
print(square[-3:-4])
# [1, 4, 9] 
# [9, 16, 25, 36, 49, 64, 81, 100] 
# [1, 4, 9, 16]
# []
```

### 复制列表
要复制列表，可创建一个包含整个列表的切片，方法是同时省略起始索引和终止索引`[:]`
```python
a=square[:]
a.append('1')
print(square)
print(a)

# [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
# [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, '1']
```
如果直接复制，只是a变为列表的别名，可以通过a操作square
```python
a=square
a.append('1')
print(square)
print(a)

# [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, '1'] 
# [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, '1']
```

## 元组
不可变的列表，使用圆括号而不是方括号来标识，定义元组后，就可以使用索引来访问其元素。
```python
sc=(3,4,5)
print(sc[0]**2+sc[1]**2==sc[2]**2)
# True
```
