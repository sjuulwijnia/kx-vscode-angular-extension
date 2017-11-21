'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import * as fileUtil from '../file-util';

import { AngularCreator } from '../angular-creator';
import { AngularSelector } from '../angular-selector';

import {
	AngularCliConfiguration,
	AngularCliDefaultsConfiguration,
	AngularCliServiceConfiguration,

	editorConfigurationWatcher,
} from '../config-watchers';

import { createServiceCode } from './angular-service-templates';

export class AngularServiceCreator extends AngularCreator<AngularCliServiceConfiguration> {
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			angularType: 'service',
			command: 'createAngularService',

			selectorPrompt: 'Enter service class name...',
			selectorPromptAppendPrefix: false
		});
	}

	protected onAngularConfigurationUpdated(angularConfiguration: AngularCliConfiguration) {
		this.configuration = {
			flat: false,
			spec: true,

			...angularConfiguration.defaults.service
		};
	}

	protected async createConfigurationManually() {
		return new Promise<AngularCliServiceConfiguration>(async resolve => {
			const flat = await this.promptList({
				defaultValue: this.configuration.flat,
				items: [
					{
						label: 'Yes',
						description: '',
						value: false
					},
					{
						label: 'No',
						description: '',
						value: true
					}
				],
				placeholder: 'Create container folder?'
			});

			const spec = await this.promptList({
				defaultValue: this.configuration.spec,
				items: [
					{
						label: 'Yes',
						description: '',
						value: true
					},
					{
						label: 'No',
						description: '',
						value: false
					}
				],
				placeholder: 'Create unit test file?'
			});

			resolve({
				flat,
				spec
			});
		});
	}

	public async createFiles(configuration: AngularCliServiceConfiguration, directory: string, selector: AngularSelector) {
		if (!configuration.flat) {
			directory += `${path.sep}${selector.filename}`;

			await fileUtil.createDirectory(directory);
		}

		const editorConfiguration = editorConfigurationWatcher();
		const filename = `${directory}${path.sep}${selector.filename}`;

		// create typescript file
		const typescript = editorConfiguration.makeCompliant(createServiceCode(configuration, selector));
		await fileUtil.createFile(`${filename}.ts`, typescript);

		// create barrel file if configured
		if (!configuration.flat && this.getConfigurationValue('createBarrelFile', true) === true) {
			const index = editorConfiguration.makeCompliant(`export * from './${selector.filename}';`);
			await fileUtil.createFile(`${directory}${path.sep}index.ts`, index);
		}

		// TODO: create spec file if configured
		if (configuration.spec) {
			const index = editorConfiguration.makeCompliant(`// TODO: create spec file yay!`);
			await fileUtil.createFile(`${filename}.spec.ts`, index);
		}

		// open .component if configured
		if (this.getConfigurationValue('openCreatedFile', true) === true) {
			this.openFileInWindow(`${filename}.ts`);
		}
	}
}
