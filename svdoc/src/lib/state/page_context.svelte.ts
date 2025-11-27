import { browser } from "$app/environment";
import { createContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";

class PageContext {
	variables: SvelteMap<string, string>;
	constructor() {
		this.variables = new SvelteMap<string, string>();

		if (browser) {
			const variables = JSON.parse(sessionStorage.getItem("svdoc-variables") || "{}");
			for (const [key, value] of Object.entries(variables)) {
				this.variables.set(key, value as string);
			}
		}
	}

	getValue(key: string): string | undefined {
		return this.variables.get(key);
	}

	setValue(key: string, value: string) {
		if (value && value != `<${key}>`) {
			this.variables.set(key, value);
		} else {
			this.variables.delete(key);
		}
		if (browser) {
			const variables: Record<string, string> = {};
			for (const [k, v] of this.variables) {
				variables[k] = v;
			}
			sessionStorage.setItem("svdoc-variables", JSON.stringify(variables));
		}
	}
}

const [getContext, setContext] = createContext<PageContext>();

function setupContext() {
	const context = new PageContext();
	setContext(context);
	return context;
}

export { getContext, PageContext, setupContext };
