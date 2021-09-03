# 破笼桌面端

使用[electron](https://www.electronjs.org/)和[electron-builder](https://www.electron.build/)打包集成后端和界面，提供破笼Linux(DEB,RPM)，Windows客户端。

### 开发

#### 安装node

[参考](https://github.com/alx696/share/wiki/Node)

#### 安装electron

项目根目录中执行：
```
export ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/
yarn add electron --dev
```

#### 安装electron-builder

项目根目录中执行：
```
export ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/
yarn add electron-builder --dev
```

#### 加载依赖

项目根目录中执行：
```
export ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/
export ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/
yarn --verbose
```

#### 启动调试

项目根目录中执行：
```
npm test
```
> 需要在项目根目录中放置来自[破笼核心](https://github.com/alx696/polong-core) 的服务`polong-core-linux`和`polong-core-windows`，以及来自 [破笼Web](https://github.com/alx696/polong-web) 的网页`web`!

---

#### 使用electron-builder打包

##### Linux

注意: Debian中, 使用默认配置打的deb包在安装时会提示缺少依赖 `libappindicator3-1` , [参考默认配置](https://www.electron.build/configuration/linux#debian-package-options) 及 [配置示例](https://github.com/hiqua/Signal-Desktop/blob/d240b21d79fe19fb94f5287dd821179b32aa4223/package.json#L340) , 在package.json中明确 `depends` 为 `["libnotify4", "libxtst6", "libnss3"]` 可以解决依赖问题. 另外一个问题时安装完毕之后会提示 `/var/lib/dpkg/info/polong.postinst:行10: update-desktop-database：未找到命令` (好像不影响使用), <del>[没有找到解决方法](https://github.com/signalapp/Signal-Desktop/issues/3694) , 只能安装前手动安装支持命令的包 `apt-cache search update-desktop-database`</del> 在package.json中明确 `afterInstall` 为自己修改的 `after-install.tpl` (去除update-desktop-database操作) 后可以解决问题.

[下载fpm-1.9.3-2.3.1-linux-x86_64.7z](https://github.com/electron-userland/electron-builder-binaries/releases/tag/fpm-1.9.3-2.3.1-linux-x86_64) 并解压到 `$HOME/.cache/electron-builder/fpm/fpm-1.9.3-2.3.1-linux-x86_64/` 中.

项目根目录中执行：
```
export ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/
export ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/
sudo apt install -y rpm
yarn --verbose && yarn linux
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
