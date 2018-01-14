'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import * as fileUtil from '../file-util';

import { ExtensionConfiguration } from '../config-watchers';

import { BaseCreator, BaseCreatorInjects } from '../base-creator';
import { BaseSelectorInvalidEnum } from '../base-selector';

import { TypescriptSelector } from './typescript-selector';

export class TypescriptCreator extends BaseCreator {
	constructor(
		command: 'class' | 'enum' | 'interface',
		protected readonly typescriptCreatorInjects: TypescriptCreatorInjects,
		protected readonly type: string = command
	) {
		super(`typescript:${command}`, typescriptCreatorInjects);
	}

	public async create(uri: vscode.Uri) {
		const directory = fileUtil.getDirectoryFromUri(uri);
		const selectorFromPrompt = await this.prompt(`Enter ${this.type} name...`);
		if (!selectorFromPrompt) {
			return;
		}

		const selector = new TypescriptSelector(selectorFromPrompt);
		switch (selector.inputInvalid) {
			case BaseSelectorInvalidEnum.OK: break;

			case BaseSelectorInvalidEnum.ERROR_INVALID_CHARACTERS:
				vscode.window.showErrorMessage(`Invalid selector entered: '${selector.input}'; make sure it contains valid characters.`);
				return;

			case BaseSelectorInvalidEnum.ERROR_STARTS_WITH_NUMBER:
				vscode.window.showErrorMessage(`Invalid selector entered: '${selector.input}'; make sure it doesn't start with a number.`);
				return;
		}

		const filePath = await this.createFiles(directory, selector);

		// open file if configured
		if (this.vscodeExtensionConfiguration.global.openCreatedFile) {
			this.openFileInWindow(filePath);
		}
	}

	protected onConfigurationUpdated() {
		// do nothing, just use the extension configuration
	}

	private createFiles(directory: string, selector: TypescriptSelector): Promise<string> {
		return new Promise<string>(async resolve => {
			const editorConfiguration = this.typescriptCreatorInjects.editorConfigurationWatcher;
			const filename = `${directory}${path.sep}${selector.filename}`;

			// create typescript file
			const typescript = editorConfiguration.makeCompliant(this.createCodeTemplate(selector));
			await fileUtil.createFile(`${filename}.ts`, typescript);

			resolve(`${filename}.ts`);
		});
	}

	private createCodeTemplate(selector: TypescriptSelector): string {
		return `export ${this.type} ${selector.clazz} {\n\n}`;
	}
}

export interface TypescriptCreatorInjects extends BaseCreatorInjects {

}
