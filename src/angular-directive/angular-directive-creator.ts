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
	AngularCliDirectiveConfiguration
} from '../config-watchers';

import { createDirectiveTemplateCode } from './angular-directive-template-code';
import { createDirectiveTemplateSpec } from './angular-directive-template-spec';

export class AngularDirectiveCreator extends AngularCreator<AngularCliDirectiveConfiguration> {
	constructor(angularCreatorInjects: AngularCreatorInjects) {
		super(angularCreatorInjects, {
			angularType: 'directive',
			command: 'createAngularDirective',

			selectorPrompt: 'Enter directive selector...',
			selectorPromptAppendPrefix: 'short'
		});
	}

	protected onAngularConfigurationUpdated(angularConfiguration: AngularCliConfiguration) {
		this.configuration = {
			flat: false,
			spec: true,

			...angularConfiguration.defaults.directive
		};
	}

	protected async createConfigurationManually() {
		return new Promise<AngularCliDirectiveConfiguration>(async resolve => {
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

	public async createFiles(configuration: AngularCliDirectiveConfiguration, directory: string, selector: AngularSelector) {
		if (!configuration.flat) {
			directory += `${path.sep}${selector.filename}`;

			await fileUtil.createDirectory(directory);
		}

		const editorConfiguration = this.angularCreatorInjects.editorConfigurationWatcher;
		const filename = `${directory}${path.sep}${selector.filename}`;

		// create typescript file
		const typescript = editorConfiguration.makeCompliant(createDirectiveTemplateCode(configuration, selector));
		await fileUtil.createFile(`${filename}.ts`, typescript);

		// create barrel file if configured
		if (!configuration.flat && this.getConfigurationValue('createBarrelFile', true) === true) {
			const index = editorConfiguration.makeCompliant(`export * from './${selector.filename}';`);
			await fileUtil.createFile(`${directory}${path.sep}index.ts`, index);
		}

		// TODO: create spec file if configured
		if (configuration.spec) {
			const spec = editorConfiguration.makeCompliant(createDirectiveTemplateSpec(configuration, selector));
			await fileUtil.createFile(`${filename}.spec.ts`, spec);
		}

		// open .component if configured
		if (this.getConfigurationValue('openCreatedFile', true) === true) {
			this.openFileInWindow(`${filename}.ts`);
		}
	}
}
