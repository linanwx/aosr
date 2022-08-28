
import {
    Component,
    MarkdownRenderer, TFile
} from "obsidian";

const imageExt = ['bmp', 'png', 'jpg', 'jpeg', 'gif', 'svg'];
const audioExt = ['mp3', 'wav', 'm4a', '3gp', 'flac', 'ogg', 'oga'];
const videoExt = ['mp4', 'webm', 'ogv'];

// obsidian api不支持嵌入图片音频视频 包装函数实现这部分功能
export async function renderMarkdown(markdown: string, el: HTMLDivElement, sourcePath: string, component: Component): Promise<void> {
    el.empty()
    try {
        await MarkdownRenderer.renderMarkdown(markdown, el, sourcePath, component);
        await handleEmbeds(el, sourcePath);
    } catch(e) {
        console.error(e)
    }
}

interface NormalizedPath {
    root: string;
    subpath: string;
    alias: string;
}
const noBreakSpace = /\u00A0/g;

export function getNormalizedPath(path: string): NormalizedPath {
    const stripped = path.replace(noBreakSpace, ' ').normalize('NFC');

    // split on first occurance of '|'
    // "root#subpath##subsubpath|alias with |# chars"
    //             0            ^        1
    const splitOnAlias = stripped.split(/\|(.*)/);

    // split on first occurance of '#' (in substring)
    // "root#subpath##subsubpath"
    //   0  ^        1
    const splitOnHash = splitOnAlias[0].split(/#(.*)/);

    return {
        root: splitOnHash[0],
        subpath: splitOnHash[1] ? '#' + splitOnHash[1] : '',
        alias: splitOnAlias[1] || '',
    };
}

function handleEmbeds(dom: HTMLDivElement, sourcePath: string) {
    return Promise.all(
        dom.findAll('.internal-embed').map(async (el) => {
            const src = el.getAttribute('src');
            if (src == null) {
                return
            }
            const normalizedPath = getNormalizedPath(src);
            const target = app.metadataCache.getFirstLinkpathDest(
                normalizedPath.root,
                sourcePath
            );
            if (!(target instanceof TFile)) {
                return;
            }
            if (imageExt.contains(target.extension)) {
                return handleImage(el, target);
            }

            if (audioExt.contains(target.extension)) {
                return handleAudio(el, target);
            }

            if (videoExt.contains(target.extension)) {
                return handleVideo(el, target);
            }
        })
    )
}

function handleImage(el: HTMLElement, file: TFile) {
    el.empty();
    el.createEl(
        'img',
        { attr: { src: app.vault.getResourcePath(file) } },
        (img) => {
            if (el.hasAttribute('width')) {
                let v = el.getAttribute('width')
                if (v) {
                    img.setAttribute('width', v);
                }
            }
            if (el.hasAttribute('height')) {
                let v = el.getAttribute('height')
                if (v) {
                    img.setAttribute('height', v);
                }
            }
            if (el.hasAttribute('alt')) {
                let v = el.getAttribute('alt')
                if (v) {
                    img.setAttribute('alt', v);
                }
            }
        }
    );
    el.addClasses(['image-embed', 'is-loaded']);
}

function handleAudio(el: HTMLElement, file: TFile) {
    el.empty();
    el.createEl('audio', {
        attr: { controls: '', src: app.vault.getResourcePath(file) },
    });
    el.addClasses(['media-embed', 'is-loaded']);
}

function handleVideo(el: HTMLElement, file: TFile) {
    el.empty();
    el.createEl(
        'video',
        { attr: { controls: '', src: app.vault.getResourcePath(file) } },
        (video) => {
            const handleLoad = () => {
                video.removeEventListener('loadedmetadata', handleLoad);
                if (video.videoWidth === 0 && video.videoHeight === 0) {
                    el.empty();
                    handleAudio(el, file);
                }
            };
            video.addEventListener('loadedmetadata', handleLoad);
        }
    );
    el.addClasses(['media-embed', 'is-loaded']);
}