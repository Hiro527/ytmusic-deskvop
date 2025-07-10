import { app, BrowserWindow } from "electron";
import Store from 'electron-store';
import path from "path";

const store = new Store({ window: {
    x: 0,
    y: 0,
    width: 900,
    height: 600,
}})

export const createMainWindow = () => {
    const window = new BrowserWindow({
        width: 900,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: 'YouTube Music'
    })

    window.loadURL('https://music.youtube.com');

    window.on('ready-to-show', () => {
        window.show();
    })

    window.on('page-title-updated', (event) => {
        event.preventDefault();
    })

    window.on('close', () => {
        app.quit();
    })

    return window
}