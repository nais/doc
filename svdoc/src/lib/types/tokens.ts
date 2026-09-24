import type { Token, Tokens } from "marked";

/**
 * Admonition token for Material for MkDocs style admonitions
 * Syntax: !!! type "title" or ??? type "title" (collapsible) or ???+ type "title" (collapsible, open)
 */
export interface AdmonitionToken extends Tokens.Generic {
	type: "admonition";
	raw: string;
	admonitionType: string;
	title: string;
	collapsible: boolean;
	open: boolean;
	tokens: Token[];
}

/**
 * Content tab token for Material for MkDocs style tabs
 * Syntax: === "Tab Title"
 */
export interface ContentTabToken extends Tokens.Generic {
	type: "content_tab";
	raw: string;
	label: string;
	tokens: Token[];
}

/**
 * Container for multiple content tabs
 */
export interface ContentTabsToken extends Tokens.Generic {
	type: "content_tabs";
	raw: string;
	tabs: ContentTabToken[];
}

/**
 * Footnote definition token ([^1]: content)
 */
export interface FootnoteToken extends Tokens.Generic {
	type: "footnote";
	raw: string;
	id: string;
	label: string;
	tokens: Token[];
}

/**
 * Definition list item (term + definitions)
 */
export interface DefinitionListItemToken extends Tokens.Generic {
	type: "def_list_item";
	raw: string;
	term: string;
	termTokens: Token[];
	definitions: DefinitionToken[];
}

/**
 * Single definition in a definition list
 */
export interface DefinitionToken extends Tokens.Generic {
	type: "definition";
	raw: string;
	tokens: Token[];
}

/**
 * Definition list container
 */
export interface DefinitionListToken extends Tokens.Generic {
	type: "def_list";
	raw: string;
	items: DefinitionListItemToken[];
}

/** A code block with prose annotations extracted from the following list. */
export interface AnnotatedCodeToken extends Tokens.Code {
	annotations?: Token[][];
}

/**
 * Frontmatter attributes extracted from markdown files
 */
export interface Attributes {
	title?: string;
	description?: string;
	/** Curated placement in llms.txt. */
	llms?: {
		section: string;
		order: number;
	};
	tags?: string[];
	hide?: string[];
	/** Conditional visibility based on tenant */
	conditional?: string[];
	/** Git metadata */
	git?: {
		/** Date the file was first created (first commit) */
		createdAt?: string;
		/** Date the file was last modified (last commit) */
		modifiedAt?: string;
		/** Relative path to the source file in the repo */
		sourcePath?: string;
	};
}
