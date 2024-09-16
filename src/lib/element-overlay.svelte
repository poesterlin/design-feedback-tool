<script lang="ts">
	import { analyzeElement } from '$lib';

	export let element: Element | null = null;
	export let noDetails = false;
	export let offset = 0;

	function getBounds(element: Element) {
		const { top, left, width, height } = element.getBoundingClientRect();
		const style = analyzeElement(element);

		return { top, left, width, height, ...style };
	}

	function getStyleString(bounds: ReturnType<typeof getBounds>) {
		let result = `font-size: ${bounds.fontSize}; outline: 1px solid #AA0000;`;

		const boxShadows = [];
		boxShadows.push(...assembleBoxShadow(bounds.padding, '#00FF0070', true));
		boxShadows.push(...assembleBoxShadow(bounds.margin, '#0000FF70', false));

		if (boxShadows.length && !noDetails) {
			result += `box-shadow: ${boxShadows.join(', ')}; `;
		}

		return result;
	}

	function parseCssShortHand(value: string) {
		const values = value.split(' ');
		if (values.length === 1) {
			return { top: values[0], right: values[0], bottom: values[0], left: values[0] };
		}
		if (values.length === 2) {
			return { top: values[0], right: values[1], bottom: values[0], left: values[1] };
		}
		if (values.length === 3) {
			return { top: values[0], right: values[1], bottom: values[2], left: values[1] };
		}
		return { top: values[0], right: values[1], bottom: values[2], left: values[3] };
	}

	function assembleBoxShadow(value: string, color: string, inset: boolean) {
		const expanded = parseCssShortHand(value);
		const insetString = inset ? 'inset ' : '';
		const insetFactor = inset ? 1 : -1;

		let { top, right, bottom, left } = expanded;

		return [
			`${insetString}0px ${mult(top, insetFactor)} 0px 0px ${color}`,
			`${insetString}${mult(right, insetFactor)} 0px 0px 0px ${color}`,
			`${insetString}0px ${mult(bottom, -insetFactor)} 0px 0px ${color}`,
			`${insetString}${mult(left, -insetFactor)} 0px 0px 0px ${color}`
		];
	}

	function mult(value: string, factor: number) {
		return `${parseFloat(value) * factor}px`;
	}
</script>

{#if element}
	{@const bounds = getBounds(element)}
	<div
		class="element-overlay"
		style="top: {bounds.top -
			offset}px; left: {bounds.left}px; width: {bounds.width}px; height: {bounds.height}px;"
	>
		<div style={getStyleString(bounds)}></div>

		{#if !noDetails}
			<div
				class="element-overlay infos"
				class:under={bounds.top < 200}
				class:left={bounds.left > 200}
				style:--width="{bounds.width}px"
			>
				<span class="header"> &lt;{element.tagName.toLowerCase()}&gt;</span>

				<table>
					<tr>
						<td>Width:</td>
						<td>{Math.ceil(bounds.width)}px</td>
					</tr>
					<tr>
						<td>Height:</td>
						<td>{Math.ceil(bounds.height)}px</td>
					</tr>

					{#if parseFloat(bounds.margin)}
						<tr>
							<td>Margin:</td>
							<td>{bounds.margin}</td>
						</tr>
					{/if}

					{#if parseFloat(bounds.padding)}
						<tr>
							<td>Padding:</td>
							<td>{bounds.padding}</td>
						</tr>
					{/if}

					{#if bounds.color}
						<tr>
							<td>Color:</td>
							<td>
								<div
									style="background: {bounds.color}; display: inline-block; width: 1em; height: 1em;"
								></div>
								{bounds.color}
							</td>
						</tr>
					{/if}
					<tr>
						<td>Font Size:</td>
						<td>{bounds.fontSize}</td>
					</tr>
				</table>
			</div>
		{/if}
	</div>
{/if}

<style>
	.element-overlay {
		position: fixed;
		z-index: 1000000;
		pointer-events: none;
	}

	.element-overlay > div {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.infos {
		position: absolute;
		left: 0;
		bottom: 100%;
		margin: 0;
		min-width: max-content;
		width: max-content;
		height: max-content;
		min-height: max-content;
		padding: 0.5em;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.infos.under {
		bottom: auto;
		top: 100%;
	}

	/* .infos.left {
		translate: calc(var(--width, 0px) * -1);
	} */

	span {
		display: block;
	}

	.header {
		font-weight: bold;
		text-align: center;
	}
</style>
