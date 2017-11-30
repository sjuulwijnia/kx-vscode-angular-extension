'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {
	AngularCliConfiguration,
	AngularCliAppConfiguration,

	AngularCliDefaultsItemConfiguration,

	AngularConfigurationWatcher,
	EditorConfigurationWatcher
} from './config-watchers';

import { AngularSelector } from './angular-selector';
import * as fileUtil from './file-util';

import {
	AngularCreatorInjects,
	AngularCreatorSettings,
	AngularCreatorSettingsAngularModuleType,
	AngularCreatorSettingsAppendPrefixType
} from './angular-creator-models';
import { addToNearestNgModule } from './angular-creator-module-finder';

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
		protected readonly angularCreatorInjects: AngularCreatorInjects,
		private readonly angularCreatorSettings: AngularCreatorSettings
	) {
		const commandWatcher = vscode.commands
			.registerCommand(`kx-vscode-angular-extension.${angularCreatorSettings.command}`, uri => {
				this.onCommandTriggered(uri)
			});

		angularCreatorInjects.angularConfigurationWatcher.subscribe(angularConfiguration => {
			if (!!angularConfiguration) {
				this.triggerConfigurationUpdate(angularConfiguration);
			}
		});

		angularCreatorInjects.context.subscriptions.push(commandWatcher);
	}

	/**
	 * When the Angular CLI configuration file is updated, this function is called to update the preconfigured options for this option.
	 * @param angularConfiguration The new Angular CLI configuration.
	 */
	protected abstract onAngularConfigurationUpdated(angularConfiguration: AngularCliConfiguration);

	/**
	 * When the option is used to create a manual configuration, this function is called. Should return a configuration.
	 */
	protected async abstract createConfigurationManually(): Promise<CONFIGURATION>;

	/**
	 * Creates the files needed for this option.
	 * @param configuration (Manual) configuration that is used to create this option.
	 * @param directory Directory to create this option in.
	 * @param selector AngularSelector class that contains all selector options.
	 * @returns Path to the created file.
	 */
	protected async abstract createFiles(configuration: CONFIGURATION, directory: string, selector: AngularSelector): Promise<string>;

	/**
	 * Gets the Visual Studio Code configuration value at @valueName. Returns @defaultValue if not found. 
	 * @param valueName The configuration value to look for.
	 * @param defaultValue Default value if @valuename couldn't be found.
	 */
	protected getConfigurationValue<T>(valueName: string, defaultValue: T): T {
		const configuration = vscode.workspace.getConfiguration(`kx-vscode-angular-extension`);
		if (!!configuration) {
			return configuration.get(valueName, defaultValue);
		}

		return defaultValue;
	}

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

	private async onCommandTriggered(uri: vscode.Uri) {
		let directory = fileUtil.getDirectoryFromUri(uri);
		let prefix = this.angularApp.prefix;
		switch (this.angularCreatorSettings.selectorPromptAppendPrefix) {
			case 'short':
				break;

			case true:
				prefix += `-`;
				break;

			default:
				prefix = '';
				break;
		}

		// get component selector
		const selectorFromPrompt = await this.prompt(this.angularCreatorSettings.selectorPrompt, prefix);
		if (!selectorFromPrompt) {
			return;
		}

		const selector = new AngularSelector(selectorFromPrompt, this.angularApp.prefix, this.angularCreatorSettings.angularType);

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
			placeholder: `Select configuration style for ${this.angularCreatorSettings.angularType.toLowerCase()}...`
		});
		if (manualConfiguration) {
			configuration = await this.createConfigurationManually();
		}

		if (!configuration.flat) {
			// create container directory
			directory += path.sep;
			if (this.getConfigurationValue<boolean>('containerSuffix', false) === true) {
				// use suffix
				directory += selector.filename;
			} else {
				// don't use suffix
				directory += selector.directory;
			}

			// check if location is valid
			if (fs.existsSync(`${directory}`)) {
				vscode.window.showErrorMessage(`Directory '${directory}' already exists.`);
				return;
			} else if (fs.existsSync(`${directory}.ts`)) {
				vscode.window.showErrorMessage(`File '${directory}.ts' already exists.`);
				return;
			}

			// valid => create directory
			fileUtil.createDirectory(directory);
		} else if (fs.existsSync(`${directory}/${selector.filename}.ts`)) {
			vscode.window.showErrorMessage(`File '${directory}${path.sep}${selector.filename}.ts' already exists.`);
			return;
		}

		const filePath = await this.createFiles(configuration, directory, selector);

		// open file if configured
		if (this.getConfigurationValue<boolean>('openCreatedFile', true) === true) {
			this.openFileInWindow(filePath);
		}

		// add to nearest NgModule if configured
		if (this.getConfigurationValue<boolean>('addToNgModule', true) === true) {
			addToNearestNgModule({
				angularConfiguration: configuration,

				optionDirectory: directory,
				optionDirectoryBarrelFile: (!configuration.flat && this.getConfigurationValue<boolean>('containerBarrelFile', true)),
				optionModuleType: this.angularCreatorSettings.angularModuleType,
				optionPath: filePath,
				optionSelector: selector,

				workspaceRoot: this.workspaceRoot
			});
		}
	}

	private triggerConfigurationUpdate(angularConfiguration: AngularCliConfiguration) {
		this._angularConfiguration = angularConfiguration;
		this.onAngularConfigurationUpdated(angularConfiguration);
	}
}

export interface ExtensionConfiguration {
	containerBarrelFile: boolean;
	openCreatedFile: boolean;
}

export interface PromptListRequest<T> {
	defaultValue: T;
	items: PromptListItem<T>[];
	placeholder: string;
}

export interface PromptListItem<T> extends vscode.QuickPickItem {
	value: T;
}
