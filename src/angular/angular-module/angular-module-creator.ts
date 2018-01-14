'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import * as fileUtil from '../../file-util';

import { AngularComponentCreator, ComponentConfiguration } from '../angular-component';
import { AngularCreator, AngularCreatorInjects } from '../angular-creator';
import { AngularSelector } from '../angular-selector';

import {
	AngularCliConfiguration,
	AngularCliDefaultsConfiguration,

	AngularCliModuleConfiguration,
	ExtensionModuleConfiguration
} from '../../config-watchers';

import { createModuleTemplateCode } from './angular-module-template-code';

export interface ModuleConfiguration extends AngularCliModuleConfiguration, ExtensionModuleConfiguration { }

export class AngularModuleCreator extends AngularCreator<ModuleConfiguration> {
	constructor(
		angularCreatorInjects: AngularCreatorInjects,
		private readonly angularComponentCreator: AngularComponentCreator
	) {
		super(angularCreatorInjects, {
			angularType: 'module',
			angularModuleType: 'imports',

			selectorPrompt: 'Enter module class name...',
			selectorPromptAppendPrefix: false
		});
	}

	protected onConfigurationUpdated() {
		this.configuration = {
			flat: false,
			spec: false,

			addToModule: false,
			containerBarrelFile: false,
			containerSuffix: false,

			...this.angularConfiguration.defaults.module,
			...this.vscodeExtensionConfiguration.angular.module
		};
	}

	protected async createConfigurationManually() {
		return new Promise<ModuleConfiguration>(async resolve => {
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

			// see if a component file is wanted
			const createModuleComponent = await this.promptList({
				defaultValue: true,
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
				placeholder: 'Create component for module?'
			});

			resolve({
				flat,
				spec,
				createModuleComponent
			});
		});
	}

	public createFiles(configuration: ModuleConfiguration, directory: string, selector: AngularSelector): Promise<string> {
		return new Promise<string>(async resolve => {

			const editorConfiguration = this.angularCreatorInjects.editorConfigurationWatcher;
			const filename = `${directory}${path.sep}${selector.filename}`;

			// create typescript file
			const typescript = editorConfiguration.makeCompliant(createModuleTemplateCode(configuration, selector));
			await fileUtil.createFile(`${filename}.ts`, typescript);

			// TODO: reimplement create spec file if configured
			// if (configuration.spec) {
			// 	const spec = editorConfiguration.makeCompliant(createPipeTemplateSpec(configuration, selector));
			// 	await fileUtil.createFile(`${filename}.spec.ts`, spec);
			// }

			// create component if wanted
			if (configuration.createModuleComponent) {
				await this.angularComponentCreator.create(vscode.Uri.file(`${filename}.ts`), selector.input);
			}

			resolve(`${filename}.ts`);
		});
	}
}
