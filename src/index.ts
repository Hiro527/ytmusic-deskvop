import RPC from 'discord-rpc';
import { app, ipcMain } from 'electron';
import { createMainWindow } from './lib/window';

export interface NowPlaying {
    title: string;
    artist: string;
    album: string;
    isExplicit: boolean;
    image: string;
    startAt: number;
}

// 多重起動の防止
if (!app.requestSingleInstanceLock()) {
    app.quit();
}

const clientId = '1392678372357705921';
const rpcClient =new RPC.Client({transport: 'ipc'});

rpcClient.login({ clientId }).catch(console.error);

app.whenReady().then(() => {
    const mainWindow = createMainWindow()

    ipcMain.handle('get::appVersion', () => {
        return app.getVersion();
    })
    
    ipcMain.handle('set::nowPlaying', (event, nowPlaying: NowPlaying) => {
        const { title, artist, album, isExplicit, image, startAt } = nowPlaying;
        const explicitText = isExplicit ? ' 🅴' : ''
        mainWindow.setTitle(`${title}${explicitText} / ${artist} - YouTube Music`);
        rpcClient.setActivity({
            details: `${title}${explicitText} / ${artist}`,
            state: album,
            largeImageKey: image,
            startTimestamp: startAt
        })
    })
    
    ipcMain.handle('set::isPlaying', (event, isPlaying) => {
        if (!isPlaying) {
            mainWindow.setTitle('YouTube Music');
            rpcClient.setActivity({
                state: 'Stopped',
                largeImageKey: 'https://storage.hiro527.com/assets/ytmusic.png',
            });
        }
    })
})
