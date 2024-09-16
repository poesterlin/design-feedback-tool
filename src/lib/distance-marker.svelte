<script lang="ts">
	import {
		calculateLength,
		getBounds,
		randomColor,
		type Bounds,
		type Line,
		type Point
	} from '$lib';
	import SvgLine from './svg-line.svelte';

	export let element1: Element;
	export let element2: Element;
	export let offset = 0;

	$: lines = findLineBetweenRectangles(getBounds(element1), getBounds(element2));
	const color = randomColor();

	function findLineBetweenRectangles(bounds1: Bounds, bounds2: Bounds) {
		let point1: Point | undefined = undefined,
			point2: Point | undefined = undefined;

		const allVertices1 = [
			{ x: bounds1.left, y: bounds1.top },
			{ x: bounds1.left + bounds1.width, y: bounds1.top },
			{ x: bounds1.left, y: bounds1.top + bounds1.height },
			{ x: bounds1.left + bounds1.width, y: bounds1.top + bounds1.height }
		];

		const allVertices2 = [
			{ x: bounds2.left, y: bounds2.top },
			{ x: bounds2.left + bounds2.width, y: bounds2.top },
			{ x: bounds2.left, y: bounds2.top + bounds2.height },
			{ x: bounds2.left + bounds2.width, y: bounds2.top + bounds2.height }
		];

		let minDistance = Infinity;

		for (const vertex1 of allVertices1) {
			for (const vertex2 of allVertices2) {
				const distance = calculateLength({ start: vertex1, end: vertex2 });
				if (distance < minDistance) {
					minDistance = distance;
					point1 = vertex1;
					point2 = vertex2;
				}
			}
		}

		if (!point1 || !point2) {
			return;
		}

		let xLine: Line | undefined = undefined,
			yLine: Line | undefined = undefined;

		if (point1.x !== point2.x) {
			const halfHeight = bounds1.height / 2;
			const end = { x: point2.x, y: point1.y };
			const target = end.y !== point2.y ? { x: point2.x, y: point2.y } : undefined;

			xLine = moveLineY({ start: point1, end, target }, halfHeight);
		}

		if (point1.y !== point2.y) {
			const halfWidth = bounds1.width / 2;
			const end = { x: point1.x, y: point2.y };
			const target = end.x !== point2.x ? { x: point2.x, y: point2.y } : undefined;

			yLine = moveLineX({ start: point1, end, target }, halfWidth);
		}

		return { xLine, yLine };
	}

	function moveLineX(line: Line, x: number) {
		line.start.x += x;
		line.end.x += x;

		return line;
	}

	function moveLineY(line: Line, y: number) {
		line.start.y += y;
		line.end.y += y;

		return line;
	}
</script>

{#if lines}
	<div class="element-overlay">
		<svg width="100vw" height="100vh" class="element-overlay">
			{#if lines.xLine}
				<SvgLine line={lines.xLine} {color} {offset} />
			{/if}
			{#if lines.yLine}
				<SvgLine line={lines.yLine} {color} {offset} />
			{/if}
		</svg>
	</div>
{/if}

<style>
	div {
		position: fixed;
		z-index: 1000000;
		inset: 0;
		top: 0px;
		pointer-events: none;
	}
</style>
