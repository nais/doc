import { execSync } from "child_process";
import { resolve } from "path";

interface GitInfo {
	/** ISO date string of first commit for the file */
	createdAt?: string;
	/** ISO date string of last commit for the file */
	modifiedAt?: string;
	/** Relative path from repo root */
	sourcePath?: string;
}

interface FileDates {
	createdAt?: string;
	modifiedAt?: string;
}

let repoRootCache: string | null | undefined;
let fileDatesCache: Map<string, FileDates> | null = null;

/**
 * Resolve the repository root, caching the result.
 *
 * Returns null if the current working directory is not a git repo.
 */
function getRepoRoot(): string | null {
	if (repoRootCache !== undefined) {
		return repoRootCache;
	}

	try {
		const root = execSync("git rev-parse --show-toplevel", {
			cwd: process.cwd(),
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		repoRootCache = resolve(root);
	} catch {
		repoRootCache = null;
	}

	return repoRootCache;
}

/**
 * Load created/modified timestamps for every tracked file in one `git log` pass.
 *
 * `git log --name-only` walks history once and emits all touched paths per commit,
 * which is dramatically faster than running `git log` per file (n commits vs n*files).
 */
function loadFileDates(repoRoot: string): Map<string, FileDates> {
	if (fileDatesCache) {
		return fileDatesCache;
	}

	const dates = new Map<string, FileDates>();

	try {
		// Format: ISO author date on its own line, then a blank line, then the
		// list of files changed by that commit, then a blank line.
		// `git log` walks newest -> oldest, so the first time we see a path is
		// its modifiedAt and the last time we see it is its createdAt.
		const output = execSync("git log --name-only --format=%x00%aI", {
			cwd: repoRoot,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
			maxBuffer: 256 * 1024 * 1024,
		});

		let currentDate: string | undefined;

		for (const rawLine of output.split("\n")) {
			const line = rawLine.trimEnd();
			if (line.startsWith("\0")) {
				currentDate = line.slice(1).trim() || undefined;
				continue;
			}
			if (!line || !currentDate) {
				continue;
			}

			const existing = dates.get(line);
			if (existing) {
				// We're walking newest -> oldest, so each subsequent entry is older.
				existing.createdAt = currentDate;
			} else {
				dates.set(line, {
					modifiedAt: currentDate,
					createdAt: currentDate,
				});
			}
		}
	} catch {
		// Ignore - we'll just return an empty map and callers degrade gracefully.
	}

	fileDatesCache = dates;
	return dates;
}

/**
 * Get git information for a file.
 *
 * The repo root and the per-file commit dates are cached on first use, so this
 * is effectively O(1) per call after the initial `git log` walk.
 */
export function getGitInfo(filePath: string): GitInfo {
	const repoRoot = getRepoRoot();
	if (!repoRoot) {
		return {};
	}

	const absolutePath = resolve(filePath);
	if (!absolutePath.startsWith(repoRoot + "/") && absolutePath !== repoRoot) {
		return {};
	}

	const sourcePath = absolutePath.slice(repoRoot.length + 1);
	const dates = loadFileDates(repoRoot).get(sourcePath);

	return {
		createdAt: dates?.createdAt,
		modifiedAt: dates?.modifiedAt,
		sourcePath,
	};
}
