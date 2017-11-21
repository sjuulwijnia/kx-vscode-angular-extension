'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {
	angularConfigurationWatcher,
	AngularCliConfiguration,
	AngularCliAppConfiguration,

	AngularCliDefaultsItemConfiguration,

	editorConfigurationWatcher
} from './config-watchers';

import { AngularSelector } from './angular-selector';
import * as fileUtil from './file-util';

export abstract class AngularCreator<CONFIGURATION extends AngularCliDefaultsItemConfiguration> {
	protected configuration: CONFIGURATION = null;

	private _angularConfiguration: AngularCliConfiguration = null;
	protected get angularConfiguration(): AngularCliConfiguration {
		return this._angularConfiguration;
	}

	private _extensionConfiguration: ExtensionConfiguration = null;
	protected get extensionConfiguration(): ExtensionConfiguration {
		return this._extensionConfiguration;
	}

	protected get angularApp(): AngularCliAppConfiguration {
		if (!this.angularConfiguration || this.angularConfiguration.apps.length === 0) {
			return null;
		}

		return this.angularConfiguration.apps[0];
	}

	protected get angularWorkspaceRoot(): string {
		const app = this.angularApp;
		if (!app) {
			return this.workspaceRoot;
		}

		return `${this.workspaceRoot}/${app.root}/${app.name || 'app'}`;
	}

	protected get workspaceRoot(): string {
		return vscode.workspace.workspaceFolders[0].uri.fsPath;
	}

	constructor(
		context: vscode.ExtensionContext,
		private readonly angularCreatorConfiguration: AngularCreatorConfiguration
	) {
		const commandWatcher = vscode.commands
			.registerCommand(`kx-vscode-angular-extension.${angularCreatorConfiguration.command}`, uri => {
				this.onCommandTriggered(uri)
			});

		angularConfigurationWatcher().subscribe(angularConfiguration => {
			if (!!angularConfiguration) {
				this.triggerConfigurationUpdate(angularConfiguration);
			}
		});

		context.subscriptions.push(commandWatcher);
	}

	protected abstract onAngularConfigurationUpdated(angularDefaultsConfiguration: AngularCliConfiguration);
	protected async abstract createConfigurationManually(): Promise<CONFIGURATION>;
	protected async abstract createFiles(configuration: CONFIGURATION, directory: string, selector: AngularSelector);

	protected getConfigurationValue<T>(valueName: string, defaultValue: T): T {
		const configuration = vscode.workspace.getConfiguration(`kx-vscode-angular-extension`);
		if (!!configuration) {
			return configuration.get(valueName, defaultValue);
		}

		return defaultValue;
	}

	protected openFileInWindow(path: string) {
		vscode.workspace
			.openTextDocument(path)
			.then(document => {
				vscode.window.showTextDocument(document);
			});
	}

	protected prompt(prompt: string, prefix = ''): Promise<string> {
		const value = (!!prefix) ? `${prefix}-` : '';
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

	private async onCommandTriggered(uri: vscode.Uri) {
		const directory = fileUtil.getDirectoryFromUri(uri);

		// get component selector
		const selectorFromPrompt = await this.prompt(this.angularCreatorConfiguration.selectorPrompt, (!!this.angularCreatorConfiguration.selectorPromptAppendPrefix ? this.angularApp.prefix : ''));
		if (!selectorFromPrompt) {
			return;
		}

		const selector = new AngularSelector(selectorFromPrompt, this.angularApp.prefix, this.angularCreatorConfiguration.angularType);

		// determine configuration style
		let configuration: CONFIGURATION = Object.assign({}, this.configuration);
		const manualConfiguration = await this.promptList({
			defaultValue: false,
			items: [
				{
					label: 'Use current @angular/cli configuration',
					description: '',
					value: false
				},
				{
					label: 'Use manual configuration',
					description: '',
					value: true
				}
			],
			placeholder: `Select configuration style for ${this.angularCreatorConfiguration.angularType.toLowerCase()}...`
		});
		if (manualConfiguration) {
			configuration = await this.createConfigurationManually();
		}

		// todo: only check if file exists if createBarrelFile = true
		if (fs.existsSync(`${directory}/${selector.filename}.ts`)) {
			vscode.window.showErrorMessage(`File '${directory}${path.sep}${selector.filename}.ts' already exists.`);
			return;
		}

		if (!configuration.flat && fs.existsSync(`${directory}/${selector.filename}`)) {
			vscode.window.showErrorMessage(`Directory '${directory}${path.sep}${selector.filename}' already exists.`);
			return;
		}

		console.log(this.angularCreatorConfiguration.angularType, configuration);
		await this.createFiles(configuration, directory, selector);
	}

	private triggerConfigurationUpdate(angularConfiguration: AngularCliConfiguration) {
		this._angularConfiguration = angularConfiguration;
		this.onAngularConfigurationUpdated(angularConfiguration);
	}
}

export interface ExtensionConfiguration {
	createBarrelFile: boolean;
	openCreatedFile: boolean;
}

export interface AngularCreatorConfiguration {
	angularType: string;

	command: string;

	selectorPrompt: string;
	selectorPromptAppendPrefix: boolean;
}

export interface PromptListRequest<T> {
	defaultValue: T;
	items: PromptListItem<T>[];
	placeholder: string;
}

export interface PromptListItem<T> extends vscode.QuickPickItem {
	value: T;
}
