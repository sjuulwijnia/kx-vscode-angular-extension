'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {
	ExtensionConfiguration,

	EditorConfigurationWatcher,
	VisualStudioCodeConfigurationWatcher
} from './config-watchers';

export abstract class BaseCreator {
	protected get context() {
		return this.baseCreatorInjects.context;
	}

	protected get vscodeExtensionConfiguration(): ExtensionConfiguration {
		return this.baseCreatorInjects.vscodeConfigurationWatcher.currentConfiguration;
	}

	constructor(
		private readonly command: string,
		private readonly baseCreatorInjects: BaseCreatorInjects
	) {
		const commandWatcher = vscode.commands
			.registerCommand(`kx-vscode-angular-extension:${command}`, uri => {
				this.create(uri);
			});

		this.context.subscriptions.push(commandWatcher);

		this.baseCreatorInjects.vscodeConfigurationWatcher.subscribe(() => {
			if (!!this.vscodeExtensionConfiguration) {
				this.onConfigurationUpdated();
			}
		});
	}

	/**
	 * Called when a command is triggered.
	 * @param uri 
	 * @param selectorFromOutside 
	 */
	public abstract async create(uri: vscode.Uri, selectorFromOutside?: string);

	/**
	 * Called whenever a subscribed configuration is updated.
	 */
	protected abstract onConfigurationUpdated();

	/**
	 * Opens the file at @path in the current workspace.
	 * @param path Path to the file that needs to be opened.
	 */
	protected openFileInWindow(path: string) {
		vscode.workspace
			.openTextDocument(path)
			.then(document => {
				vscode.window.showTextDocument(document);
			});
	}

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

export interface BaseCreatorInjects {
	context: vscode.ExtensionContext;

	editorConfigurationWatcher: EditorConfigurationWatcher;
	vscodeConfigurationWatcher: VisualStudioCodeConfigurationWatcher;
}

export interface PromptListRequest<T> {
	defaultValue: T;
	items: PromptListItem<T>[];
	placeholder: string;
}

export interface PromptListItem<T> extends vscode.QuickPickItem {
	value: T;
}

