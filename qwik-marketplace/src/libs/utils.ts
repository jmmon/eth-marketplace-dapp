export const shortText = (text: string, length = 20: number): string => {
	console.log('text length:', text.length);
	console.log('length:', length);
	if (text.length <= length) return text;
	return text.slice(
		0,
		length - 3,
	)
	.trim()
	.concat("...")
}