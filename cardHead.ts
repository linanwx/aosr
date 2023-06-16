export const CardIDTag = "AOSR"

// 更新卡片第一行的卡片ID
export function UpdateCardIDTag(cardid:string, fileText:string, index:number):string {
    // let tag = " #" + CardIDTag + "/" + cardid
    let tag = ` #${CardIDTag}/${cardid} [[#^${cardid}|🔗]]`
    for (let i=index;i<fileText.length;i++) {
        if (fileText[i] == "\n") {
            fileText = fileText.slice(0, i) + tag + fileText.slice(i)
            break;
        }
    }
    return fileText
}
