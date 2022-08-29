/**
 * Returns the cyrb53 hash (hex string) of the input string
 * Please see https://stackoverflow.com/a/52171480 for more details
 *
 * @param str - The string to be hashed
 * @param seed - The seed for the cyrb53 function
 * @returns The cyrb53 hash (hex string) of `str` seeded using `seed`
 */
type Hex = number;
export function cyrb53(str: string, len:number, seed = 0, radix = 32): string {
	let h1: Hex = 0xdeadbeef ^ seed, h2: Hex = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	let ret = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(radix).slice(0, len);
	// 如果全是数字 则添加一个z字符保证符合obsidian命名规则
	if (/^[\d]+$/.test(ret)) {
		ret =  "z" + ret
		ret = ret.slice(0, len)
	}
	return ret
}
