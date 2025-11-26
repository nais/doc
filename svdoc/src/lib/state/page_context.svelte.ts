import { createContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";

class PageContext {
	variables: SvelteMap<string, string>;
	constructor() {
		this.variables = new SvelteMap<string, string>();
	}
}

const [getContext, setContext] = createContext<PageContext>();

function setupContext() {
	const context = new PageContext();
	setContext(context);
	return context;
}

export { getContext, PageContext, setupContext };
