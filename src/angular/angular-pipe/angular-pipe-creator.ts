'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import * as fileUtil from '../../file-util';

import { AngularCreatorInjects } from '../angular-creator-models';
import { AngularCreator } from '../angular-creator';
import { AngularSelector } from '../angular-selector';

import {
	AngularCliConfiguration,
	AngularCliDefaultsConfiguration,
	AngularCliPipeConfiguration,

	ExtensionPipeConfiguration
} from '../../config-watchers';

import { createPipeTemplateCode } from './angular-pipe-template-code';
import { createPipeTemplateSpec } from './angular-pipe-template-spec';

export interface PipeConfiguration extends AngularCliPipeConfiguration, ExtensionPipeConfiguration { }

export class AngularPipeCreator extends AngularCreator<PipeConfiguration> {
	constructor(angularCreatorInjects: AngularCreatorInjects) {
		super(angularCreatorInjects, {
			angularType: 'pipe',
			angularModuleType: 'declarations',

			selectorPrompt: 'Enter pipe name...',
			selectorPromptAppendPrefix: false
		});
	}

	protected onConfigurationUpdated() {
		this.configuration = {
			flat: false,
			spec: true,

			addToModule: true,
			containerBarrelFile: false,
			containerSuffix: false,

			...this.angularConfiguration.defaults.pipe,
			...this.extensionConfiguration.pipe
		};
	}

	protected async createConfigurationManually() {
		return new Promise<PipeConfiguration>(async resolve => {
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

	public createFiles(configuration: PipeConfiguration, directory: string, selector: AngularSelector): Promise<string> {
		return new Promise<string>(async resolve => {
			const editorConfiguration = this.angularCreatorInjects.editorConfigurationWatcher;
			const filename = `${directory}${path.sep}${selector.filename}`;

			// create typescript file
			const typescript = editorConfiguration.makeCompliant(createPipeTemplateCode(configuration, selector));
			await fileUtil.createFile(`${filename}.ts`, typescript);

			// create spec file if configured
			if (configuration.spec) {
				const spec = editorConfiguration.makeCompliant(createPipeTemplateSpec(configuration, selector));
				await fileUtil.createFile(`${filename}.spec.ts`, spec);
			}

			resolve(`${filename}.ts`);
		});
	}
}
