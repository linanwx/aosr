export const CardIDTag = "AOSR"

// ID 在笔记里有两种写法：旧的 #AOSR/xxx（标签），新的 %%AOSR/xxx%%（Obsidian 注释，不进标签面板）
// 复习数据一律以标签写法 #AOSR/xxx 为键（见 TagInfo.Canonical），两种写法读出来的键相同
export function IDComment(canonical: string): string {
	return `%%${canonical.replace(/^#/, "")}%%`
}

// 更新卡片第一行的卡片ID
export function UpdateCardIDTag(cardid:string, fileText:string, index:number):string {
    let tag = ` ${IDComment(`#${CardIDTag}/${cardid}`)}`
    for (let i=index;i<fileText.length;i++) {
        if (fileText[i] == "\n") {
            fileText = fileText.slice(0, i) + tag + fileText.slice(i)
            break;
        }
    }
    return fileText
}
