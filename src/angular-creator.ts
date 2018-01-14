'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import {
	AngularConfigurationWatcher,
	EditorConfigurationWatcher,
	VisualStudioCodeConfigurationWatcher,

	AngularCliConfiguration,
	AngularCliAppConfiguration,
	AngularCliDefaultsItemConfiguration,
	ExtensionConfiguration,
	ExtensionDefaultOptionConfiguration
} from './config-watchers';

import {
	AngularSelector,
	AngularSelectorInvalidEnum
} from './angular-selector';
import * as fileUtil from './file-util';

import {
	AngularCreatorInjects,
	AngularCreatorSettings,
	AngularCreatorSettingsAngularModuleType,
	AngularCreatorSettingsAppendPrefixType
} from './angular-creator-models';
import { addToNearestNgModule } from './angular-creator-module-finder';

export abstract class AngularCreator<CONFIGURATION extends AngularCliDefaultsItemConfiguration & ExtensionDefaultOptionConfiguration> {
	protected configuration: CONFIGURATION = null;

	protected get angularConfiguration(): AngularCliConfiguration {
		return this.angularCreatorInjects.angularConfigurationWatcher.currentConfiguration;
	}

	protected get extensionConfiguration(): ExtensionConfiguration {
		return this.angularCreatorInjects.vscodeConfigurationWatcher.currentConfiguration;
	}

	protected get angularApp(): AngularCliAppConfiguration {
		if (!this.angularConfiguration || this.angularConfiguration.apps.length === 0) {
			vscode.window.showErrorMessage(`No application configuration found in the .angular-cli.json file.`);
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
				this.create(uri);
			});

		angularCreatorInjects.angularConfigurationWatcher.subscribe(() => {
			if (!!this.angularConfiguration) {
				this.onConfigurationUpdated();
			}
		});

		angularCreatorInjects.vscodeConfigurationWatcher.subscribe(() => {
			if (!!this.extensionConfiguration) {
				this.onConfigurationUpdated();
			}
		});

		angularCreatorInjects.context.subscriptions.push(commandWatcher);
	}

	/**
	 * When the Angular CLI configuration or Visual Studio Code configuration is updated, this function is called to update the preconfigured options for this option.
	 */
	protected abstract onConfigurationUpdated();

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

	public async create(uri: vscode.Uri, selectorFromOutside?: string) {
		// just to be safe
		this.onConfigurationUpdated();

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
		const selectorFromPrompt = selectorFromOutside || await this.prompt(this.angularCreatorSettings.selectorPrompt, prefix);
		if (!selectorFromPrompt) {
			return;
		}

		const selector = new AngularSelector(selectorFromPrompt, this.angularApp.prefix, this.angularCreatorSettings.angularType);
		switch (selector.inputInvalid) {
			case AngularSelectorInvalidEnum.OK: break;

			case AngularSelectorInvalidEnum.ERROR_INVALID_CHARACTERS:
				vscode.window.showErrorMessage(`Invalid selector entered: '${selector.input}'; make sure it contains valid characters.`);
				return;

			case AngularSelectorInvalidEnum.ERROR_STARTS_WITH_NUMBER:
				vscode.window.showErrorMessage(`Invalid selector entered: '${selector.input}'; make sure it doesn't start with a number.`);
				return;
		}

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
			if (configuration.containerSuffix) {
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
			await fileUtil.createDirectory(directory);

			// check whether to create a barrel file or not
			if (configuration.containerBarrelFile) {
				const index = this.angularCreatorInjects.editorConfigurationWatcher.makeCompliant(`export * from './${selector.filename}';`);
				await fileUtil.createFile(`${directory}${path.sep}index.ts`, index);
			}
		} else if (fs.existsSync(`${directory}/${selector.filename}.ts`)) {
			vscode.window.showErrorMessage(`File '${directory}${path.sep}${selector.filename}.ts' already exists.`);
			return;
		}

		const filePath = await this.createFiles(configuration, directory, selector);

		// open file if configured
		if (!selectorFromOutside && this.extensionConfiguration.global.openCreatedFile) {
			this.openFileInWindow(filePath);
		}

		// add to nearest NgModule if configured
		if (configuration.addToModule) {
			addToNearestNgModule({
				angularConfiguration: configuration,

				optionDirectory: directory,
				optionDirectoryBarrelFile: (!configuration.flat && configuration.containerBarrelFile),
				optionModuleType: this.angularCreatorSettings.angularModuleType,
				optionPath: filePath,
				optionSelector: selector,

				workspaceRoot: this.workspaceRoot
			});
		}
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
