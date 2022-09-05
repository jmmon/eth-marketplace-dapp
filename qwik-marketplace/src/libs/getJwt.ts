export function toBase64(str: string) {
	return btoa(str);
}

export function fromBase64(str: string) {
  return atob(str);
}

export function getJwtString(user: any) {
	const stringUser = JSON.stringify(user);
	const jwt = toBase64(stringUser);
	return jwt;
}

export function getJwtObj(cookies: any) {
  const jwt = cookies.jwt && fromBase64(cookies.jwt);
  return jwt ? JSON.parse(jwt) : null;
}
