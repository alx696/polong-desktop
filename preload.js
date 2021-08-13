/*

网页到main.js的中间人

*/

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    "electron", {
    openPath: (path) => {
        return ipcRenderer.invoke('open-path', path);
    }
}
);
