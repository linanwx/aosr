export const CardIDTag = "AOSR"

// ID 在笔记里有两种写法：旧的 #AOSR/xxx（标签），新的 %%AOSR/xxx%%（Obsidian 注释，不进标签面板）
// 复习数据一律以标签写法 #AOSR/xxx 为键（见 TagInfo.Canonical），两种写法读出来的键相同
export function IDComment(canonical: string): string {
	return `%%${canonical.replace(/^#/, "")}%%`
}

// 旧写法的 ID：标签前必须是行首或空白，与 Obsidian 识别标签的规则一致
const oldIDReg = /(^|\s)#(AOSR\/[\w\/]+)/gm

// 不能动的区域：围栏代码块（用户可能在里面写示例），以及已有的 %%...%% 注释
// （被注释掉的卡片里如果有旧 ID，改成 %% 会和外层注释的 %% 配错对）
function protectedRanges(text: string): [number, number][] {
	let ranges: [number, number][] = []
	for (let m of text.matchAll(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm)) {
		ranges.push([m.index || 0, (m.index || 0) + m[0].length])
	}
	for (let m of text.matchAll(/%%[\s\S]*?%%/g)) {
		ranges.push([m.index || 0, (m.index || 0) + m[0].length])
	}
	return ranges
}

// 把笔记里的旧写法 #AOSR/xxx 改成 %%AOSR/xxx%%，返回新文本和改动的个数
export function convertOldIDs(text: string): { text: string, count: number } {
	let ranges = protectedRanges(text)
	let count = 0
	let newText = text.replace(oldIDReg, (match: string, prefix: string, id: string, offset: number) => {
		let pos = offset + prefix.length
		if (ranges.some(([start, end]) => pos >= start && pos < end)) {
			return match
		}
		count++
		return `${prefix}%%${id}%%`
	})
	return { text: newText, count: count }
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
