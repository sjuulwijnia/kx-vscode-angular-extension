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

	AngularCliComponentConfiguration,
	AngularCliComponentConfigurationChangeDetection,
	AngularCliComponentConfigurationInline,
	AngularCliComponentConfigurationViewEncapsulation,

	editorConfigurationWatcher
} from '../config-watchers';

import { createComponentTemplateCode } from './angular-component-template-code';
import { createComponentTemplateSpec } from './angular-component-template-spec';

export class AngularComponentCreator extends AngularCreator<AngularCliComponentConfiguration> {
	constructor(context: vscode.ExtensionContext) {
		super(context, {
			angularType: 'component',
			command: 'createAngularComponent',

			selectorPrompt: 'Enter component selector...',
			selectorPromptAppendPrefix: true
		});
	}

	protected onAngularConfigurationUpdated(angularConfiguration: AngularCliConfiguration) {
		this.configuration = {
			changeDetection: 'Default',
			flat: false,
			inlineStyle: false,
			inlineTemplate: false,
			spec: true,
			viewEncapsulation: 'Emulated',

			...angularConfiguration.defaults.component
		};
	}

	protected async createConfigurationManually() {
		return new Promise<AngularCliComponentConfiguration>(async resolve => {
			// determine HTML style
			const inlineTemplate = await this.promptList<AngularCliComponentConfigurationInline>({
				defaultValue: this.configuration.inlineTemplate,
				items: [
					{
						label: 'Separate file',
						description: '',
						value: false
					},
					{
						label: 'Inline',
						description: '',
						value: true
					},
					{
						label: 'No HTML',
						description: '',
						detail: 'Creates NO template references.',
						value: 'None'
					}
				],
				placeholder: 'Select HTML location...'
			});

			// determine CSS style
			const inlineStyle = await this.promptList<AngularCliComponentConfigurationInline>({
				defaultValue: this.configuration.inlineStyle,
				items: [
					{
						label: 'Separate file',
						description: '',
						value: false
					},
					{
						label: 'Inline',
						description: '',
						value: true
					},
					{
						label: 'No style',
						description: '',
						detail: 'Creates NO style references.',
						value: 'None'
					}
				],
				placeholder: 'Select CSS location...'
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
				placeholder: 'Select change detection strategy...'
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
					placeholder: 'Select view encapsulation...'
				});
			};

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
				changeDetection,
				viewEncapsulation,
				spec,
				flat,
				inlineStyle,
				inlineTemplate
			});
		});
	}

	public async createFiles(configuration: AngularCliComponentConfiguration, directory: string, selector: AngularSelector) {
		if (!configuration.flat) {
			directory += `${path.sep}${selector.filename}`;

			await fileUtil.createDirectory(directory);
		}

		const editorConfiguration = editorConfigurationWatcher();
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

		// create barrel file if configured
		if (!configuration.flat && this.getConfigurationValue('createBarrelFile', true) === true) {
			const index = editorConfiguration.makeCompliant(`export * from './${selector.filename}';`);
			await fileUtil.createFile(`${directory}${path.sep}index.ts`, index);
		}

		// TODO: create spec file if configured
		if (configuration.spec) {
			const spec = editorConfiguration.makeCompliant(createComponentTemplateSpec(selector));
			await fileUtil.createFile(`${filename}.spec.ts`, spec);
		}

		// open .component if configured
		if (this.getConfigurationValue('openCreatedFile', true) === true) {
			this.openFileInWindow(`${filename}.ts`);
		}
	}
}
