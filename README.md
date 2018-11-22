# README

## 环境

mysql
```
create database ztxbbs;
```
应用会自动建表

nodejs ^ 8.4.0
npm ^ 5.3.0

## 安装

解压压缩包
进入ztxbbs目录
按需配置

/config/userconfig.js
/config/config.js

其中包含一些参数
数据库的账号密码
SMTP邮件服务配置等信息

命令行命令
```
npm install
npm start
```
此时即可启动应用

## 其他
/public/images 中有一些默认图片，可以按需修改

可在package.json文件中找到其他的脚本命令，这些命令可以按需更改，启动命令为`npm run XXX`