'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import * as fileUtil from '../file-util';

import { AngularCreator, AngularCreatorInjects } from '../angular-creator';
import { AngularSelector } from '../angular-selector';

import {
	AngularCliConfiguration,
	AngularCliDefaultsConfiguration,
	AngularCliPipeConfiguration
} from '../config-watchers';

import { createPipeTemplateCode } from './angular-pipe-template-code';
import { createPipeTemplateSpec } from './angular-pipe-template-spec';

export class AngularPipeCreator extends AngularCreator<AngularCliPipeConfiguration> {
	constructor(angularCreatorInjects: AngularCreatorInjects) {
		super(angularCreatorInjects, {
			angularType: 'pipe',
			command: 'createAngularPipe',

			selectorPrompt: 'Enter pipe name...',
			selectorPromptAppendPrefix: false
		});
	}

	protected onAngularConfigurationUpdated(angularConfiguration: AngularCliConfiguration) {
		this.configuration = {
			flat: false,
			spec: true,

			...angularConfiguration.defaults.pipe
		};
	}

	protected async createConfigurationManually() {
		return new Promise<AngularCliPipeConfiguration>(async resolve => {
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

	public async createFiles(configuration: AngularCliPipeConfiguration, directory: string, selector: AngularSelector) {
		if (!configuration.flat) {
			directory += `${path.sep}${selector.filename}`;

			await fileUtil.createDirectory(directory);
		}

		const editorConfiguration = this.angularCreatorInjects.editorConfigurationWatcher;
		const filename = `${directory}${path.sep}${selector.filename}`;

		// create typescript file
		const typescript = editorConfiguration.makeCompliant(createPipeTemplateCode(configuration, selector));
		await fileUtil.createFile(`${filename}.ts`, typescript);

		// create barrel file if configured
		if (!configuration.flat && this.getConfigurationValue('createBarrelFile', true) === true) {
			const index = editorConfiguration.makeCompliant(`export * from './${selector.filename}';`);
			await fileUtil.createFile(`${directory}${path.sep}index.ts`, index);
		}

		// TODO: create spec file if configured
		if (configuration.spec) {
			const spec = editorConfiguration.makeCompliant(createPipeTemplateSpec(configuration, selector));
			await fileUtil.createFile(`${filename}.spec.ts`, spec);
		}

		// open .component if configured
		if (this.getConfigurationValue('openCreatedFile', true) === true) {
			this.openFileInWindow(`${filename}.ts`);
		}
	}
}
