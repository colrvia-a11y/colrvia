export function uid(prefix = 'id_') {
	return prefix + Math.random().toString(36).slice(2, 10);
}
