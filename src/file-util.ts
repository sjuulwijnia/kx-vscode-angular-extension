'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export function getDirectoryFromUri(uri: vscode.Uri) {
	if (fs.lstatSync(uri.fsPath).isDirectory()) {
		return uri.fsPath;
	}

	return path.dirname(uri.fsPath);
}

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
