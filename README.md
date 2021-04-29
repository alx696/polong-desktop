# 破笼桌面端

使用[electron](https://www.electronjs.org/)和[electron-builder](https://www.electron.build/)打包集成后端和界面，提供破笼Linux(DEB,RPM)，Windows客户端。

### 开发

#### 安装node

[参考](https://github.com/alx696/share/wiki/Node)

---

#### 安装electron

项目根目录中执行：
```
$ ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/ yarn add electron --dev
```

#### 安装electron-builder

项目根目录中执行：
```
$ ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/ yarn add electron-builder --dev
```

#### 加载依赖

项目根目录中执行：
```
$ yarn --verbose
```
> 首次执行时要相当长的时间，会一直停在`[-/2] waiting...`. 直到生成了yarn.lock文件, 才算完成.

#### 启动调试

项目根目录中执行：
```
$ npm start
```
> 需要在项目根目录中放置服务程序`service`和`service.exe`，来自[破笼核心](https://github.com/alx696/polong-core)。`web`目录，来自[破笼Web](https://github.com/alx696/polong-web)!

---

#### 使用electron-builder打包

##### Linux

[下载镜像 fpm-1.9.3-2.3.1-linux-x86_64.7z](https://xm.lilu.red:444/soft/fpm-1.9.3-2.3.1-linux-x86_64.7z)并解压到 `$HOME/.cache/electron-builder/fpm/fpm-1.9.3-2.3.1-linux-x86_64/` 中.
> [fpm来源](https://github.com/electron-userland/electron-builder-binaries/releases/tag/fpm-1.9.3-2.3.1-linux-x86_64)

项目根目录中执行：
```
$ sudo apt install -y rpm
$ yarn --verbose && yarn dist
```
> [参考](https://www.electron.build/#quick-setup-guide)

##### Windows

[下载镜像 electronuserland/builder:wine-mono](https://xm.lilu.red:444/soft/electronuserland-builder-wine-mono.tar.gz)并导入到Docker中.

项目根目录中执行：
```
$ docker run -it --rm \
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
```
> [参考](https://www.electron.build/multi-platform-build#docker)

---

#### 使用electron-forge打包

参考:
* https://www.electronjs.org/docs/tutorial/quick-start#package-and-distribute-the-application
* https://www.turtle-techies.com/how-to-package-your-multiplatform-electron-app/

```
$ npx @electron-forge/cli import
$ npm run make
```
> 注意: 这种方式比较容易, 但是程序名称不能设置中文(乱码).
