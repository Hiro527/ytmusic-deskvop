import { ipcRenderer } from "electron";
import { NowPlaying } from ".";

const PLAY_BUTTON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" focusable=\"false\" aria-hidden=\"true\" style=\"pointer-events: none; display: inherit; width: 100%; height: 100%;\"><path d=\"m7 4 12 8-12 8V4z\"></path></svg>" 

window.onload = async () => {
    setInterval(() => {
        const isPlaying = getIsPlaying();
        ipcRenderer.invoke('set::isPlaying', isPlaying);
        if (isPlaying) {
            const nowPlaying = getNowPlaying();
            if (nowPlaying) {
                ipcRenderer.invoke('set::nowPlaying', nowPlaying);
            }
        }
    }, 1000)
}

const getStartTimeStamp = (timestamp: string): number => {
    const [minutes, seconds] = timestamp.split(':').map(Number);
    return Math.floor(new Date().getTime() / 1000)  - (minutes * 60 + seconds)
}

const getIsPlaying = () => {
    const playButtonElement = document.evaluate('/html/body/ytmusic-app/ytmusic-app-layout/ytmusic-player-bar/div[1]/div/yt-icon-button[3]/button/yt-icon/span/div', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLDivElement;
    const isPlaying = playButtonElement.innerHTML !== PLAY_BUTTON_SVG;
    return isPlaying
}

const getNowPlaying = (): NowPlaying | null => {
    const titleElement = document.evaluate('//*[@id="layout"]/ytmusic-player-bar/div[2]/div[2]/yt-formatted-string', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const artistElement = document.evaluate('//*[@id="layout"]/ytmusic-player-bar/div[2]/div[2]/span/span[2]/yt-formatted-string/a[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const albumElement = document.evaluate('//*[@id="layout"]/ytmusic-player-bar/div[2]/div[2]/span/span[2]/yt-formatted-string/a[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const isExplicit = document.evaluate('//*[@id="badges"]/ytmusic-inline-badge-renderer/yt-icon/span/div', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const image = document.evaluate('//*[@id="layout"]/ytmusic-player-bar/div[2]/div[1]/img', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLImageElement;
    const timestamp = document.evaluate('/html/body/ytmusic-app/ytmusic-app-layout/ytmusic-player-bar/div[1]/span', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    
    if (!titleElement || !artistElement || !albumElement) {
        return null
    }

    return {
        title: titleElement ? titleElement.textContent! : '',
        artist: artistElement ? artistElement.textContent! : '',
        album: albumElement ? albumElement.textContent! : '',
        isExplicit: !!isExplicit,
        image: image ? image.src : '',
        startAt: timestamp ? getStartTimeStamp(timestamp.textContent!.split(' / ')[0]) : 0
    };
}
