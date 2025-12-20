import { execSync } from "child_process";
import { resolve } from "path";

export interface GitInfo {
	/** ISO date string of first commit for the file */
	createdAt?: string;
	/** ISO date string of last commit for the file */
	modifiedAt?: string;
	/** Relative path from repo root */
	sourcePath?: string;
}

/**
 * Get git information for a file
 */
export function getGitInfo(filePath: string): GitInfo {
	// Resolve to absolute path
	const absolutePath = resolve(filePath);

	let repoRoot: string;
	try {
		repoRoot = execSync("git rev-parse --show-toplevel", {
			cwd: process.cwd(),
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
	} catch {
		return {};
	}

	// Get the path relative to the repo root
	let sourcePath: string | undefined;
	const resolvedRepoRoot = resolve(repoRoot);
	if (absolutePath.startsWith(resolvedRepoRoot)) {
		sourcePath = absolutePath.slice(resolvedRepoRoot.length + 1);
	}

	let createdAt: string | undefined;
	let modifiedAt: string | undefined;

	try {
		// Get the date of the first commit (creation date)
		// Use --follow to handle renames, get all commits and take the last one (oldest)
		const createdResult = execSync(`git log --follow --format=%aI -- "${absolutePath}"`, {
			cwd: repoRoot,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		});
		const dates = createdResult.trim().split("\n").filter(Boolean);
		if (dates.length > 0) {
			// Last entry is the oldest (first commit)
			createdAt = dates[dates.length - 1];
		}
	} catch {
		// File might not be tracked by git
	}

	try {
		// Get the date of the last commit (modification date)
		const modifiedResult = execSync(`git log -1 --format=%aI -- "${absolutePath}"`, {
			cwd: repoRoot,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		});
		const modifiedDate = modifiedResult.trim();
		if (modifiedDate) {
			modifiedAt = modifiedDate;
		}
	} catch {
		// File might not be tracked by git
	}

	return {
		createdAt,
		modifiedAt,
		sourcePath,
	};
}
