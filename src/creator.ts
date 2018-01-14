'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export abstract class Creator {
	constructor(
		private readonly command: string,
		private readonly context: vscode.ExtensionContext
	) {
		const commandWatcher = vscode.commands
			.registerCommand(`kx-vscode-angular-extension.${command}`, uri => {
				this.create(uri);
			});

		context.subscriptions.push(commandWatcher);
	}

	public abstract async create(uri: vscode.Uri, selectorFromOutside?: string);

	/**
	 * Prompts for a single string value.
	 * @param prompt Prompt containing the question which should lead to a string.
	 * @param prefix Prefix for the given answer. Optional.
	 */
	protected prompt(prompt: string, prefix = ''): Promise<string> {
		const value = (!!prefix) ? prefix : '';
		const valueSelection: [number, number] = [value.length, value.length];

		return new Promise(resolve => {
			vscode.window.showInputBox({
				value,
				valueSelection,
				prompt
			}).then(result => {
				resolve(result);
			});
		});
	}

	protected promptList<T>(request: PromptListRequest<T>): Promise<T> {
		const index = request.items.findIndex(pli => pli.value === request.defaultValue);
		if (index !== -1) {
			const defaultItem = request.items.splice(index, 1)[0];
			defaultItem.description = '(default)';

			request.items = [
				defaultItem,
				...request.items
			];
		}

		request.items.forEach(item => {
			if (item.value === request.defaultValue) {
				item.description = '(default)';
			}
		})

		return new Promise(resolve => {
			vscode.window.showQuickPick(request.items, {
				placeHolder: request.placeholder
			}).then(result => {
				if (!!result) {
					resolve(result.value);
					return;
				}

				resolve(request.defaultValue);
			});
		});
	}
}

export interface PromptListRequest<T> {
	defaultValue: T;
	items: PromptListItem<T>[];
	placeholder: string;
}

export interface PromptListItem<T> extends vscode.QuickPickItem {
	value: T;
}

