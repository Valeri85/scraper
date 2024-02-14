export function getData(data: string): Promise<string> {
	return new Promise((resolve, reject) => resolve(data));
}
