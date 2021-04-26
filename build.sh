#!/bin/sh
set -ex

# 检查编译windows服务的依赖是否安装（sqlite必须设置CGO_ENABLED=1，否则无法使用. 编译要成功就必须安装gcc-multilib gcc-mingw-w64）
if !(dpkg -s gcc-mingw-w64 | grep "Status" >/dev/null) ; then
    echo "没有安装 gcc-multilib gcc-mingw-w64 ,须在apt中安装!"
    exit 1
fi

# 检查linux rpm打包依赖
if !(dpkg -s rpm | grep "Status" >/dev/null) ; then
    echo "没有安装 rpm ,须在apt中安装!"
    exit 1
fi

# 拉取polong-core
git clone --depth=1 git@github.com:alx696/polong-core.git
cd polong-core
go mod download
# 编译linux服务
go build -o ../service
# 编译windows服务
GOOS=windows GOARCH=amd64 CGO_ENABLED=1 CC=x86_64-w64-mingw32-gcc CXX=x86_64-w64-mingw32-g++ go build -o ../service.exe
# 删除
cd .. && rm -rf polong-core

# 拉取polong-web
git clone --depth=1 git@github.com:alx696/polong-web.git
mv polong-web web

# 打包deb
ELECTRON_CACHE="~/.cache/electron"
ELECTRON_MIRROR="http://npm.taobao.org/mirrors/electron/"
ELECTRON_BUILDER_CACHE="~/.cache/electron-builder"
ELECTRON_BUILDER_BINARIES_MIRROR="http://npm.taobao.org/mirrors/electron-builder-binaries/"
yarn --verbose && yarn dist

# 打包windows
docker run -it --rm \
--env ELECTRON_CACHE="/root/.cache/electron" \
--env ELECTRON_MIRROR="http://npm.taobao.org/mirrors/electron/" \
--env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
--env ELECTRON_BUILDER_BINARIES_MIRROR="http://npm.taobao.org/mirrors/electron-builder-binaries/" \
--env DEBUG="electron-builder,electron-builder:*" \
-v ${PWD}:/project \
-v ${PWD##*/}-node-modules:/project/node_modules \
-v ~/.cache/electron:/root/.cache/electron \
-v ~/.cache/electron-builder:/root/.cache/electron-builder \
-v ~/.cache/yarn:/usr/local/share/.cache/yarn \
electronuserland/builder:wine-mono /bin/bash -c "yarn --verbose && yarn win"

# 删除服务和web目录
rm -rf service service.exe web

echo "构建完毕"