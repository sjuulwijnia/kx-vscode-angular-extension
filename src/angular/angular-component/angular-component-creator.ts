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

	AngularCliComponentConfiguration,
	AngularCliComponentConfigurationChangeDetection,
	AngularCliComponentConfigurationInline,
	AngularCliComponentConfigurationViewEncapsulation,

	ExtensionComponentConfiguration
} from '../../config-watchers';

import { createComponentTemplateCode } from './angular-component-template-code';
import { createComponentTemplateSpec } from './angular-component-template-spec';

export interface ComponentConfiguration extends AngularCliComponentConfiguration, ExtensionComponentConfiguration { }

export class AngularComponentCreator extends AngularCreator<ComponentConfiguration> {
	constructor(angularCreatorInjects: AngularCreatorInjects) {
		super(angularCreatorInjects, {
			angularType: 'component',
			angularModuleType: 'declarations',

			selectorPrompt: 'Enter component selector...',
			selectorPromptAppendPrefix: true
		});
	}

	protected onConfigurationUpdated() {
		this.configuration = {
			changeDetection: 'Default',
			flat: false,
			inlineStyle: false,
			inlineTemplate: false,
			spec: true,
			viewEncapsulation: 'Emulated',

			addToModule: true,
			containerBarrelFile: false,
			containerSuffix: false,

			...this.angularConfiguration.defaults.component,
			...this.extensionConfiguration.component
		};
	}

	protected async createConfigurationManually() {
		return new Promise<ComponentConfiguration>(async resolve => {
			// determine HTML style
			const inlineTemplateExtension = 'HTML';
			const inlineTemplate = await this.promptList<AngularCliComponentConfigurationInline>({
				defaultValue: this.configuration.inlineTemplate,
				items: [
					{
						label: `Separate ${inlineTemplateExtension} file`,
						description: '',
						value: false
					},
					{
						label: `Inline ${inlineTemplateExtension}`,
						description: '',
						value: true
					},
					{
						label: 'No template',
						description: '',
						detail: 'Creates NO template references.',
						value: 'None'
					}
				],
				placeholder: `Select component ${inlineTemplateExtension} location...`
			});

			// determine CSS style
			const inlineStyleExtension = this.angularConfiguration.defaults.styleExt.toUpperCase();
			const inlineStyle = await this.promptList<AngularCliComponentConfigurationInline>({
				defaultValue: this.configuration.inlineStyle,
				items: [
					{
						label: `Separate ${inlineStyleExtension} file`,
						description: '',
						value: false
					},
					{
						label: `Inline ${inlineStyleExtension}`,
						description: '',
						value: true
					},
					{
						label: 'No styling',
						description: '',
						detail: 'Creates NO style references.',
						value: 'None'
					}
				],
				placeholder: `Select component ${inlineStyleExtension} location...`
			});

			// determine change detection
			const changeDetection = await this.promptList<AngularCliComponentConfigurationChangeDetection>({
				defaultValue: this.configuration.changeDetection,
				items: [
					{
						label: 'Default',
						description: '',
						value: 'Default'
					},
					{
						label: 'OnPush',
						description: '',
						value: 'OnPush'
					}
				],
				placeholder: 'Select component change detection strategy...'
			});

			// determine viewEncapsulation (only if inlineStyle is not 'None')
			let viewEncapsulation: AngularCliComponentConfigurationViewEncapsulation = 'Emulated';
			if (inlineStyle !== 'None') {
				viewEncapsulation = await this.promptList<AngularCliComponentConfigurationViewEncapsulation>({
					defaultValue: this.configuration.viewEncapsulation,
					items: [
						{
							label: 'Emulated',
							description: '',
							value: 'Emulated'
						},
						{
							label: 'Native',
							description: '',
							value: 'Native'
						},
						{
							label: 'None',
							description: '',
							value: 'None'
						}
					],
					placeholder: `Select component view encapsulation (${inlineStyleExtension} isolation)...`
				});
			};

			const flat = await this.promptList({
				defaultValue: this.configuration.flat,
				items: [
					{
						label: 'Yes, create a container directory',
						description: '',
						value: false
					},
					{
						label: 'No',
						description: '',
						value: true
					}
				],
				placeholder: 'Create container directory for component?'
			});

			const spec = await this.promptList({
				defaultValue: this.configuration.spec,
				items: [
					{
						label: 'Yes, create a unit test file',
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
				changeDetection,
				viewEncapsulation,
				spec,
				flat,
				inlineStyle,
				inlineTemplate
			});
		});
	}

	public async createFiles(configuration: ComponentConfiguration, directory: string, selector: AngularSelector): Promise<string> {
		return new Promise<string>(async resolve => {
			const editorConfiguration = this.angularCreatorInjects.editorConfigurationWatcher;
			const filename = `${directory}${path.sep}${selector.filename}`;

			// create typescript file
			const typescript = editorConfiguration.makeCompliant(createComponentTemplateCode(configuration, selector, this.angularConfiguration.defaults.styleExt));
			await fileUtil.createFile(`${filename}.ts`, typescript);

			// create style file if configured
			if (!configuration.inlineStyle) {
				const style = editorConfiguration.makeCompliant(`:host { }`);
				await fileUtil.createFile(`${filename}.${this.angularConfiguration.defaults.styleExt}`, style);
			}

			// create html file if configured
			if (!configuration.inlineTemplate) {
				const html = editorConfiguration.makeCompliant(`<div>\n\t${selector.component} works!\n</div>`);
				await fileUtil.createFile(`${filename}.html`, html);
			}

			// create spec file if configured
			if (configuration.spec) {
				const spec = editorConfiguration.makeCompliant(createComponentTemplateSpec(configuration, selector));
				await fileUtil.createFile(`${filename}.spec.ts`, spec);
			}

			resolve(`${filename}.ts`);
		});
	}
}
