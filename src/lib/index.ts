export interface Bounds {
	top: number;
	left: number;
	width: number;
	height: number;
}

export interface Point {
	x: number;
	y: number;
}

export interface Line {
	start: Point;
	end: Point;
	target?: Point;
}

export function analyzeElement(element: Element) {
	const results = {
		margin: '',
		padding: '',
		fontSize: '',
		color: ''
	};

	const styles = window.getComputedStyle(element);
	results.margin = styles.margin;
	results.padding = styles.padding;
	results.fontSize = styles.fontSize;
	results.color = styles.color;

	return results;
}

export function setCssVariable(name: string, value: string) {
	document.documentElement.style.setProperty(name, value);
}

export function calculateLength(line: { start: Point; end: Point }) {
	const a = line.start.x - line.end.x;
	const b = line.start.y - line.end.y;
	return Math.ceil(Math.sqrt(a * a + b * b));
}

export function getBounds(element: Element) {
	const { top, left, width, height } = element.getBoundingClientRect();
	return { top, left, width, height };
}

export function randomColor() {
	const hue = Math.floor(Math.random() * 360);
	return `hsl(${hue}, 100%, 50%)`;
}
