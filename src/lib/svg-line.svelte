<script lang="ts">
	import { calculateLength, type Line } from '$lib';

	export let line: Line;
	export let color: string;
	export let offset = 0;

	const length = calculateLength(line);
	const textWidth = length.toString().length * 10 + 25;
</script>

<line
	x1={line.start.x}
	y1={line.start.y - offset}
	x2={line.end.x}
	y2={line.end.y - offset}
	stroke={color}
	stroke-width="2"
/>
<!-- 
{#if line.target}
	<line
		x1={line.target.x}
		y1={line.target.y}
		x2={line.end.x}
		y2={line.end.y}
		stroke="black"
		stroke-width="1"
	/>
{/if} -->

{#if length > 20}
	<!-- text background -->
	<circle cx={line.start.x} cy={line.start.y - offset} r="5" fill={color} opacity="0.5" />
	<circle cx={line.end.x} cy={line.end.y - offset} r="5" fill={color} opacity="0.5" />
{/if}

{#if length > 10}
	<rect
		x={(line.start.x + line.end.x - textWidth) / 2}
		y={(line.start.y + line.end.y) / 2 - 10 - offset}
		width={textWidth}
		height="20"
		fill="white"
		opacity="0.9"
	></rect>
	<text
		x={(line.start.x + line.end.x) / 2}
		y={(line.start.y + line.end.y) / 2 - offset}
		fill="black"
		font-size="20"
		text-anchor="middle"
		alignment-baseline="middle">{length}px</text
	>
{/if}

<style>
	:global(svg) {
		font-family: monospace;
	}
</style>
