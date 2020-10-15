<img width="500px" src="https://blog.papercut.com/wp-content/uploads/2019/02/docker-logo-1024x597.png">

> 图片来源：https://blog.papercut.com/wp-content/uploads/2019/02/docker-logo-1024x597.png

## 前言

Docker 对于前端来说不是必须的，但是如果需要自己折腾前端工具、建站等，涉及到应用部署的话就必须要去了解下相关知识了。

本文只是对 Docker 的入门，看完本文后会对 Docker 的概念以及如何使用 docker 有个初步的认知。

对于前端来说，有个入门的认识应该就够了。

## Docker 的概念

docker 音译过来是“容器”，但是 docker 有三大概念：

- 镜像 image
- 容器 container
- 仓库 repository

镜像和容器的关系就如 JS 中的类与实例。

在 JS 中，我们常用的包管理工具 npm，我们会将 npm 包 `npm publish` 到免费的公共服务上。

而 docker 的镜像就如同托管在远程服务的 npm 包一样，docker 也有托管服务 `Docker Hub`，我们可以创建自己的 **仓库** Respository，本地通过 `docker push <仓库/name:tag>`

同理，我们通过 `npm install` 安装在本地 `node_modules` 中的包的“形态”，就类似 **容器** container。

关于 docker 的其他概念或作用，网上都能找到，就不再赘述了。

## 构建镜像

譬如，我有一个需求，是将一个 npm 命令行工具构建成 docker 包，并 push 到远程仓库，提供给运维部署时用。

首先我的思路有 2 种：

> 该镜像必然依赖 node，暂且是 `node:latest` 好了，因为不需要考虑其他功能。

1. 在本地 npm 包的根目录下构建 docker 镜像，将完整的包构建进去，这样就不用再下载了
2. 构建空的镜像，其中包含一条执行命令，去安装该 npm 包

于是，我去实践这 2 种思路。

实践的结果当然只能是方案二合理，因为构建的 docker 包，虽然上下文指定了当前目录，但是并未将文件拷贝到对应的 root 的文件系统中。需要自己去 `COPY`，但是 copy 只能单个文件。

想想 node_modules 吧，因为 npm 命令行工具依赖。

于是乎，将 npm 包压缩成一个 zip 包后再 copy 到文件系统中似乎可行。的确如此！但是 copy 的过程也是很慢的，node_modules 的嵌套依赖太过庞大。

所以总的来看，通过在 node 容器中，执行安装命令**清晰易懂**

构建命令：

```
# -t 表示指定要创建的目标镜像名
# tag 默认为 latest
# context 表示构建上下文，下文会说
docker build -t <name:tag> <context>
```

## 操作本地镜像

查看本地镜像

```
docker images
docker image ls
```

> 有时候会出现 <none> 的镜像，可以使用 docker image prune 清除，这类镜像被称为“虚悬镜像”，无用。

根据镜像创建容器

```
# -i: 交互式操作
# -t: 终端
docker run -i -t <name:tag> /bin/bash/
```

镜像删除

```
docker rmi <name:tag>
```

## 操作本地容器

通过镜像创建的容器实例，一般我们也只用关心简单的启动、停止和删除。

查看本地容器

```
docker ps -a
```

其它

```
# 启动
docker start <ID>

# 停止
docker stop <ID>

# 删除
docker rm -f <ID>
```

## 发布镜像

上面我们创建镜像的时候会指定 tag，也可以单独指定 tag。

```
docker tag <ID> <name:新的tag>
```

创建后会看到本地新增了一条镜像记录。

本地创建镜像后，便可以直接 push 到仓库

```
docker push <repository/name:tag>
```

这里需要自己注册 docker hub 的账号，并创建相应的仓库。

## 一些需要注意的点

创建的构建文件名按照约定必须是 `Dockerfile`

构建时的 context 指定需要慎重，需要将当前目录无关的文件剔除，其余文件都会作为上下文去构建当前镜像，譬如我们要做 `COPY` 操作，对于相对路径就是依赖上下文 context。

我们可以使用 `.dockerignore` 来剔除无关文件，语法和 `.gitignore` 一致。

Dockerfile 的书写规范，语法类似 shell 语法，只不过需要使用 docker 的关键字命令来处理。

docker 中的关键字命令都会单独创建一个层来执行，一般对于前端命令，是没有必要创建多个层也就是多个 `RUN` 命令的，应该一行语句写完。

## 参考

- [Docker 教程](https://www.runoob.com/docker/docker-tutorial.html)
- [Docker 从入门到实践](https://yeasy.gitbook.io/docker_practice/)





