/*

网页到main.js的中间人

*/

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    "electron", {
    appShow: () => {
        ipcRenderer.send('app-show', '');
    },
    openPath: (path) => {
        return ipcRenderer.invoke('open-path', path);
    }
}
);
