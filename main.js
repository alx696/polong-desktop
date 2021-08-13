// https://www.electronjs.org/
const { app, Menu, BrowserWindow, dialog, ipcMain, shell } = require('electron');
// https://nodejs.org/api/path.html
const path = require('path');
// https://nodejs.org/api/child_process.html
const { execFile } = require("child_process");
// https://www.npmjs.com/package/get-port
const getPort = require('get-port');
// https://github.com/megahertz/electron-log
const log = require('electron-log');

// 响应中间人 preload.js 事件
ipcMain.handle('open-path', async (evt, arg) => {
  log.debug('打开文件', arg);
  return await shell.openPath(arg);
});
ipcMain.on('app-show', (evt, arg) => {
  log.debug('显示应用');
  myWindow.show();
});

let serviceProcess = null;

function startService(resourcesPath, dir, ptpPort, webPort) {
  log.info(`启动后台服务参数( 资源目录:${resourcesPath} 文件目录:${dir} 服务端口:${ptpPort} 网页端口:${webPort} )`);

  let serviceName = 'polong-core-linux';
  if (process.platform === 'win32') {
    serviceName = 'polong-core-windows';
  }
  const servicePath = path.join(resourcesPath, serviceName);
  log.info(`后台服务文件路径: ${servicePath}`);

  serviceProcess = execFile(
    servicePath,
    [
      `--safe-directory=${dir}`,
      `--file-directory=${dir}`,
      `--p2p-port=${ptpPort}`,
      `--web-port=${webPort}`
    ],
    (error, stdout, stderr) => {
      if (error) {
        log.error(error);
        dialog.showErrorBox('服务运行错误', error.message);
        return;
      }

      if (stdout) {
        log.debug(stdout);
        return;
      }

      log.warn(stderr);
    }
  );
  log.debug('后台服务进程', serviceProcess.pid);
}

function createWindow() {
  //去除菜单
  Menu.setApplicationMenu(null);

  //确定资源目录
  let resourcesPath = process.resourcesPath;
  if (app.commandLine.getSwitchValue("test") !== '') {
    resourcesPath = app.getAppPath();
  }

  // https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions
  const win = new BrowserWindow({
    useContentSize: true,
    width: 960,
    height: 800,
    minWidth: 960,
    minHeight: 800,
    icon: path.join(app.getAppPath(), 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(resourcesPath, "preload.js")
    },
    show: false // https://www.electronjs.org/docs/api/browser-window#%E4%BD%BF%E7%94%A8ready-to-show%E4%BA%8B%E4%BB%B6
  });
  win.once('ready-to-show', () => {
    win.show()
  });

  //打开调试工具时立即获得焦点
  win.webContents.on('devtools-opened', () => {
    win.focus();
    setImmediate(() => {
      win.focus();
    });
  });

  //根据参数打开调试工具
  if (app.commandLine.getSwitchValue("debug") !== '') {
    // 最大化窗口
    win.maximize();
    // 打开调试工具
    win.webContents.openDevTools();
  }

  //快捷键打开调试工具
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.code === 'KeyD') {
      event.preventDefault();

      // 打开调试工具
      win.webContents.openDevTools();
    } else if (input.control && input.code === 'KeyR') {
      event.preventDefault();

      //重新加载页面
      win.reload();
    }
  });

  //获取数据目录参数
  const argDir = app.commandLine.getSwitchValue("dir");

  //查找2个可用端口
  Promise.all([
    getPort(),
    getPort()
  ])
    .then(values => {
      log.debug(`资源目录: ${resourcesPath}, 可用端口: ${values}`);

      //启动服务,关闭窗口时关闭服务
      startService(resourcesPath, argDir, values[0], values[1]);
      // win.on('closed', () => {
      //   stopService();
      // });

      //显示网页
      win.loadFile(`${resourcesPath}/web/1.html`, { query: { "port": values[1], "version": app.getVersion() } });
    })
    .catch(error => {
      log.error(error);
      dialog.showErrorBox('启动失败', '没有可用端口');
    });

  return win;
}

// 设置Windows Application User Model ID
app.setAppUserModelId('red.lilu.app.pl');

app.on('before-quit', function () {
  log.info('结束进程');
  serviceProcess.kill();
});

// quit application when all windows are closed
app.on('window-all-closed', () => {
  log.info('退出应用');
  app.requestSingleInstanceLock();

  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 只允许启动一个实例
let myWindow = null;
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (myWindow) {
      if (myWindow.isMinimized()) {
        myWindow.restore();
      }
      myWindow.focus();
    }
  })

  // 创建 myWindow, 加载应用的其余部分, etc...
  app.whenReady().then(() => {
    myWindow = createWindow();
  })
}