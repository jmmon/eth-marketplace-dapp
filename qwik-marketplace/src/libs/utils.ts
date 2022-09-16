export const shortText = (text: string, length = 30: number): string => {
	return text.slice(
		0,
		text.length > length // if text is long, return length chars including ...
			? length - 3
			: text.length * 2/3 // else return 2/3 of the text length
	)
	.trim()
	.concat("...")
}