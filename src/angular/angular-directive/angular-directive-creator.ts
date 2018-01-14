'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import * as fileUtil from '../../file-util';

import { AngularCreator, AngularCreatorInjects } from '../angular-creator';
import { AngularSelector } from '../angular-selector';

import {
	AngularCliConfiguration,
	AngularCliDefaultsConfiguration,
	AngularCliDirectiveConfiguration,

	ExtensionDirectiveConfiguration
} from '../../config-watchers';

import { createDirectiveTemplateCode } from './angular-directive-template-code';
import { createDirectiveTemplateSpec } from './angular-directive-template-spec';

export interface DirectiveConfiguration extends AngularCliDirectiveConfiguration, ExtensionDirectiveConfiguration { }

export class AngularDirectiveCreator extends AngularCreator<DirectiveConfiguration> {
	constructor(angularCreatorInjects: AngularCreatorInjects) {
		super(angularCreatorInjects, {
			angularType: 'directive',
			angularModuleType: 'declarations',

			selectorPrompt: 'Enter directive selector...',
			selectorPromptAppendPrefix: 'short'
		});
	}

	protected onConfigurationUpdated() {
		if (!this.angularConfiguration || !this.vscodeExtensionConfiguration) {
			return;
		}

		this.configuration = {
			flat: false,
			spec: true,

			addToModule: true,
			containerBarrelFile: false,
			containerSuffix: false,

			...this.angularConfiguration.defaults.directive,
			...this.vscodeExtensionConfiguration.angular.directive
		};
	}

	protected async createConfigurationManually() {
		return new Promise<DirectiveConfiguration>(async resolve => {
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

	public createFiles(configuration: DirectiveConfiguration, directory: string, selector: AngularSelector): Promise<string> {
		return new Promise<string>(async resolve => {
			const editorConfiguration = this.angularCreatorInjects.editorConfigurationWatcher;
			const filename = `${directory}${path.sep}${selector.filename}`;

			// create typescript file
			const typescript = editorConfiguration.makeCompliant(createDirectiveTemplateCode(configuration, selector));
			await fileUtil.createFile(`${filename}.ts`, typescript);

			// create spec file if configured
			if (configuration.spec) {
				const spec = editorConfiguration.makeCompliant(createDirectiveTemplateSpec(configuration, selector));
				await fileUtil.createFile(`${filename}.spec.ts`, spec);
			}

			resolve(`${filename}.ts`);
		});
	}
}
