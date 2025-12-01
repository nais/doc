import type { CodeVariable } from "$lib/helpers/shiki";
import type { Token } from "marked";

/**
 * Admonition token for Material for MkDocs style admonitions
 * Syntax: !!! type "title" or ??? type "title" (collapsible) or ???+ type "title" (collapsible, open)
 */
export interface AdmonitionToken {
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
export interface ContentTabToken {
	type: "content_tab";
	raw: string;
	label: string;
	tokens: Token[];
}

/**
 * Container for multiple content tabs
 */
export interface ContentTabsToken {
	type: "content_tabs";
	raw: string;
	tabs: ContentTabToken[];
}

/**
 * Footnote reference token (inline [^1])
 */
export interface FootnoteRefToken {
	type: "footnoteRef";
	raw: string;
	id: string;
	label: string;
}

/**
 * Footnote definition token ([^1]: content)
 */
export interface FootnoteToken {
	type: "footnote";
	raw: string;
	id: string;
	label: string;
	tokens: Token[];
}

/**
 * Container for all footnotes at the end of a document
 */
export interface FootnotesToken {
	type: "footnotes";
	raw: string;
	items: FootnoteToken[];
}

/**
 * HTML block with markdown attribute parsed
 */
export interface HtmlWithMarkdownToken {
	type: "html_with_markdown";
	raw: string;
	text: string;
	openTag: string;
	closeTag: string;
	innerTokens: Token[];
}

/**
 * Syntax-highlighted code block with Shiki
 */
export interface HighlightedCodeToken {
	type: "highlighted_code";
	raw: string;
	text: string;
	lang: string;
	html: string;
	title?: string;
	annotations: CodeAnnotation[];
	variables: CodeVariable[];
}

/**
 * Code annotation linked to a line
 */
export interface CodeAnnotation {
	id: string;
	line: number;
	tokens: Token[];
}

/**
 * Definition list item (term + definitions)
 */
export interface DefinitionListItemToken {
	type: "def_list_item";
	raw: string;
	term: string;
	termTokens: Token[];
	definitions: DefinitionToken[];
}

/**
 * Single definition in a definition list
 */
export interface DefinitionToken {
	type: "definition";
	raw: string;
	tokens: Token[];
}

/**
 * Definition list container
 */
export interface DefinitionListToken {
	type: "def_list";
	raw: string;
	items: DefinitionListItemToken[];
}

/**
 * Frontmatter attributes extracted from markdown files
 */
export interface Attributes {
	title?: string;
	description?: string;
	tags?: string[];
	hide?: string[];
}
