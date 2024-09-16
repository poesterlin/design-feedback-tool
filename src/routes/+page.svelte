<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import DistanceMarker from '$lib/distance-marker.svelte';
	import ElementOverlay from '$lib/element-overlay.svelte';
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';

	export let data;

	let mouse = { x: 0, y: 0 };
	let cleanups: { element: Element; class: string }[] = [];
	let element: Element | null = null;
	let compute: Element[] = [];
	let isQueryFocused = false;
	let ctrlPressed = false;

	let startOffset = 0;
	let scrollOffset = 0;
	$: currentOffset = scrollOffset - startOffset;
	$: currentOffsetStyle = getOffsetStyle(currentOffset);

	const debouncedAnalyzeElementAt = debounce(analyzeElementAt, 20);

	$: debouncedAnalyzeElementAt(mouse);

	onMount(async () => {
		await tick();

		const documentTitle = document.title || 'Elements';
		document.title = `Analyzing ${documentTitle}`;

		const links = document.querySelectorAll('a');
		links.forEach((link) => {
			if (link.classList.contains('element-overlay')) {
				return;
			}

			link.addEventListener('click', (e) => {
				e.preventDefault();

				if (ctrlPressed) {
					return;
				}

				const host = new URL(window.location.href).host;
				const queryHost = new URL(data.query).host;
				const href = link.href.replace(host, queryHost);
				goto('/?query=' + encodeURIComponent(href));
			});
		});
	});

	function analyzeElementAt(coords: { x: number; y: number }) {
		if (!browser || !ctrlPressed) {
			element = null;
			return;
		}

		const hovered = document.elementFromPoint(coords.x, coords.y);
		if (!hovered) {
			return;
		}

		if (
			hovered.classList.contains('element-overlay') ||
			hovered.tagName === 'HTML' ||
			hovered.tagName === 'BODY'
		) {
			return;
		}

		element = hovered;
		cleanups.forEach(({ element, class: className }) => element.classList.remove(className));

		hovered.classList.add('hovered');

		const parent = hovered.parentElement;
		if (parent) {
			parent.classList.add('hover-parent');
			cleanups.push({ element: parent, class: 'hover-parent' });
		}

		cleanups.push({ element: hovered, class: 'hovered' });
	}

	function debounce(func: Function, wait: number) {
		let timeout: number;
		return function (this: any, ...args: any[]) {
			const context = this;
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(context, args), wait);
		};
	}

	function toggleDistance() {
		if (!element) {
			analyzeElementAt(mouse);
		}

		if (!element) {
			return;
		}

		if (compute.includes(element)) {
			compute = compute.filter((el) => el !== element);
		} else if (ctrlPressed) {
			compute.push(element);
			compute = compute;
			startOffset = scrollOffset;
		}
	}

	function offsetElements(event: Event) {
		scrollOffset = (event.target as HTMLElement).scrollTop;
		debouncedAnalyzeElementAt(mouse);
	}

	function keyDownHandler(event: KeyboardEvent) {
		ctrlPressed = event.key === 'Control';

		if (event.key === 'Escape') {
			element = null;
			cleanups.forEach(({ element, class: className }) => element.classList.remove(className));
			cleanups = [];
			compute = [];
		}

		if ((event.key === 'Delete' || event.key === 'Backspace') && element) {
			cleanups.forEach(({ element, class: className }) => element.classList.remove(className));
			cleanups = [];
			compute = compute.filter((el) => el !== element);

			element.remove();
			element = null;
		}
	}

	function keyUpHandler(event: KeyboardEvent) {
		if (ctrlPressed) {
			ctrlPressed = event.key !== 'Control';
		}
	}

	function getOffsetStyle(offset: number) {
		if (offset === 0) {
			return '';
		}

		return `transform: translateY(${offset * -1}px)`;
	}
</script>

<svelte:window
	on:mousemove={(e) => (mouse = { x: e.clientX, y: e.clientY })}
	on:keydown={keyDownHandler}
	on:keyup={keyUpHandler}
/>

{#if isQueryFocused || ((!data.query || mouse.y < 100) && !ctrlPressed)}
	<form action="/" class="element-overlay" transition:fly={{ y: -100, duration: 200 }}>
		<input
			type="url"
			value={data.query}
			name="query"
			placeholder="URL"
			class="element-overlay"
			on:focus={() => (isQueryFocused = true)}
			on:blur={() => (isQueryFocused = false)}
		/>
		<button type="submit" class="element-overlay">Analyze</button>
	</form>
{:else}
	<div transition:fly={{ y: -100, duration: 200 }} class="corner-banner">Element Analyzer</div>
{/if}

{#await data.pageContent}
	<p>Loading...</p>
{:then value}
	{#if value}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			data-sveltekit-preload-data="false"
			on:scroll={offsetElements}
			class="html-container"
			on:click|preventDefault={toggleDistance}
		>
			{@html value}
		</div>
	{:else}
		<div class="explainer">
			<h1>Welcome to the Element Analyzer!</h1>
			<h2>Explanation:</h2>
			<p>
				To analyze a page, enter a URL in the input field above and click "Analyze". The page will
				be loaded in and you can analyze the elements by <b>
					hovering over them and pressing the "Control" key
				</b>.
			</p>

			<p>
				To measure the distance between two elements, <b>control-click</b> on the first element and then
				on the second element. This is still buggy.
			</p>

			<p>
				If an element obstructs your view, you can first select it, by <b>control-clicking</b> on
				it. You can then <b>delete</b> it by pressing the "Delete" or "Backspace".
			</p>
		</div>
	{/if}
{/await}

<div class="overlay-container element-overlay" style={currentOffsetStyle}>
	<ElementOverlay {element} />

	{#each compute as el, i}
		{@const next = compute[i + 1]}
		<ElementOverlay element={el} noDetails />
		{#if next}
			<ElementOverlay element={next} noDetails />
			<DistanceMarker element1={el} element2={next} offset={currentOffset} />
		{/if}
	{/each}
</div>

<style>
	:global(.hovered) {
		outline: 2px solid red;
	}

	:global(.hover-parent) {
		outline: 1px solid rgba(80, 80, 80, 0.534);
	}

	p {
		margin: 1rem;
		padding: 1rem;
	}

	form {
		position: fixed;
		top: 1rem;
		left: 1rem;
		right: 1rem;
		width: min(90vw, 800px);
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(255, 255, 255, 0.8);
		z-index: 1000000;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		margin: auto;
		padding: 1rem;
		border-radius: 1rem;
	}

	form input {
		padding: 0.5rem;
		font-size: 1rem;
		color: black;
		border: 1px solid #007bff;
		border-radius: 0.25rem;
		background: white;
		margin-right: 0.5rem;
		min-width: max-content;
		flex: 1;
	}

	form button {
		padding: 0.5rem;
		border-radius: 0.25rem;
		font-size: 1rem;
		color: white;
		background: #007bff;
		border: none;
		cursor: pointer;
	}

	input {
		padding: 0.5rem;
		font-size: 1rem;
	}

	button {
		padding: 0.5rem;
		font-size: 1rem;
	}

	.html-container {
		position: fixed;
		inset: 0;
		overflow: auto;
	}

	.explainer {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.corner-banner {
		position: fixed;
		top: 0;
		left: 0;
		background: #f44336;
		color: white;
		rotate: -45deg;
		z-index: 100000;
		translate: -30% 100%;
		padding: 0.5rem 100px;
		opacity: 0.8;
	}
</style>
