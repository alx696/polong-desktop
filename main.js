// https://www.electronjs.org/
const { app, Menu, BrowserWindow, dialog } = require('electron');
// https://nodejs.org/api/path.html
const path = require('path');
// https://nodejs.org/api/child_process.html
const { execFile } = require("child_process");
// https://www.npmjs.com/package/get-port
const getPort = require('get-port');
// https://github.com/megahertz/electron-log
const log = require('electron-log');

let serviceProcess = null;

function startService(dir, ptpPort, webPort) {
  log.info('启动服务:', dir, ptpPort, webPort);

  let serviceName = 'polong-core-linux';
  if (process.platform === 'win32') {
    serviceName = 'polong-core-windows';
  }

  // 当资源是asar存档形式时, 只支持execFile
  // https://www.electronjs.org/docs/tutorial/application-packaging#extra-unpacking-on-some-apis
  serviceProcess = execFile(
    path.join(app.getAppPath(), serviceName),
    [
      `--safe-directory=${dir}`,
      `--file-directory=${dir}`,
      `--p2p-port=${ptpPort}`,
      `--web-port=${webPort}`
    ],
    (error, stdout, stderr) => {
      if (error) {
        log.error('服务运行日志:', error);
        dialog.showErrorBox('服务运行错误', error.message);
        return;
      }
      log.info('服务运行日志:', stdout, stderr);
    }
  );
}

function stopService() {
  log.info('停止服务');
  if (serviceProcess === null) {
    return;
  }

  serviceProcess.kill();
}

function createWindow() {
  //去除菜单
  Menu.setApplicationMenu(null);

  // https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions
  const win = new BrowserWindow({
    useContentSize: true,
    width: 960,
    height: 800,
    minWidth: 960,
    minHeight: 800,
    icon: path.join(app.getAppPath(), 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true
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
      console.debug('可用端口', values);

      //启动服务,关闭窗口时关闭服务
      startService(argDir, values[0], values[1]);
      win.on('closed', () => {
        stopService();
      });

      //显示网页
      win.loadFile('web/1.html', { query: { "port": values[1], "version": app.getVersion() } });
    })
    .catch(error => {
      console.error('没有可用端口', error);
      dialog.showErrorBox('启动失败', '没有可用端口');
    });
}

// 设置Windows Application User Model ID
app.setAppUserModelId('red.lilu.app.pl');

// 只允许启动一个实例
app.requestSingleInstanceLock();

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  createWindow();
});