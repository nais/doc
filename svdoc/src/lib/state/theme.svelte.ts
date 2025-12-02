import { createContext } from "svelte";

export type Theme = "light" | "dark";

class ThemeState {
	#theme: Theme = $state("dark");

	get theme(): Theme {
		return this.#theme;
	}

	set theme(value: Theme) {
		this.#theme = value;
	}

	get isDark(): boolean {
		return this.#theme === "dark";
	}
}

const [getTheme, setTheme] = createContext<ThemeState>();

function setupTheme(initialTheme: Theme = "dark"): ThemeState {
	const state = new ThemeState();
	state.theme = initialTheme;
	setTheme(state);
	return state;
}

export { getTheme, setupTheme, ThemeState };
