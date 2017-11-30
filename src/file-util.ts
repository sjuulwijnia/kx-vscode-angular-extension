'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export async function createDirectory(path: string) {
	return new Promise<void>(resolve => {
		fs.mkdir(path, () => {
			resolve();
		});
	});
}

export async function createFile(path: string, content: string) {
	return new Promise<void>(resolve => {
		fs.writeFile(path, content, () => {
			resolve();
		});
	});
}

export function findFiles(findGlobPattern: vscode.GlobPattern, maxResults?: number): Promise<vscode.Uri[]> {
	return new Promise<vscode.Uri[]>(resolve => {
		vscode.workspace
			.findFiles(findGlobPattern, null, maxResults)
			.then(uris => {
				resolve(uris);
			});
	});
}

export function getDirectoryFromUri(uri: vscode.Uri) {
	if (fs.lstatSync(uri.fsPath).isDirectory()) {
		return uri.fsPath;
	}

	return path.dirname(uri.fsPath);
}

export function openFile(uri: vscode.Uri) {
	return new Promise<string>(resolve => {
		if (!uri.fsPath || uri.scheme !== 'file') {
			resolve(null);
			return;
		}

		fs.readFile(uri.fsPath, 'utf-8', (error, data) => {
			resolve(data.toString());
		});
	})
}
