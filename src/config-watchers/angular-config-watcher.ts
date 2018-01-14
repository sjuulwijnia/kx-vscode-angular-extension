'use strict';
import * as vscode from 'vscode';

import { BaseConfigWatcher } from './base-config-watcher';

export class AngularConfigurationWatcher extends BaseConfigWatcher<AngularCliConfiguration> {
	private static instance: AngularConfigurationWatcher = new AngularConfigurationWatcher();

	private constructor() {
		super('.angular-cli.json');
	}

	public static initialize(context: vscode.ExtensionContext) {
		return AngularConfigurationWatcher.instance.initialize(context);
	}

	protected triggerConfigurationUpdate(angularConfigurationJson: string) {
		this.setCurrentConfiguration(JSON.parse(this.sanitizeJson(angularConfigurationJson)) as AngularCliConfiguration);

		this.triggerCallbacks();
	}

	protected triggerConfigurationDelete() {

	}
}

export interface AngularCliConfiguration {
	apps: AngularCliAppConfiguration[];

	defaults: AngularCliDefaultsConfiguration;
}

export interface AngularCliAppConfiguration {
	name: string;
	prefix: string;
	root: string;
}

export interface AngularCliDefaultsConfiguration {
	styleExt?: string;

	component?: AngularCliComponentConfiguration;
	directive?: AngularCliDirectiveConfiguration;
	guard?: AngularCliGuardConfiguration;
	module?: AngularCliModuleConfiguration;
	pipe?: AngularCliPipeConfiguration;
	service?: AngularCliServiceConfiguration;
}

export interface AngularCliDefaultsItemConfiguration {
	flat: boolean;
	spec: boolean;
}

export interface AngularCliComponentConfiguration extends AngularCliDefaultsItemConfiguration {
	changeDetection: AngularCliComponentConfigurationChangeDetection;
	inlineStyle: AngularCliComponentConfigurationInline;
	inlineTemplate: AngularCliComponentConfigurationInline;
	viewEncapsulation: AngularCliComponentConfigurationViewEncapsulation;
}
export type AngularCliComponentConfigurationChangeDetection = 'Default' | 'OnPush';
export type AngularCliComponentConfigurationInline = boolean | 'None';
export type AngularCliComponentConfigurationViewEncapsulation = 'Emulated' | 'Native' | 'None';

export interface AngularCliDirectiveConfiguration extends AngularCliDefaultsItemConfiguration {

}

export interface AngularCliGuardConfiguration extends AngularCliDefaultsItemConfiguration {

}

export interface AngularCliGuardConfiguration extends AngularCliDefaultsItemConfiguration {

}

export interface AngularCliModuleConfiguration extends AngularCliDefaultsItemConfiguration {

}

export interface AngularCliPipeConfiguration extends AngularCliDefaultsItemConfiguration {

}

export interface AngularCliServiceConfiguration extends AngularCliDefaultsItemConfiguration {

}
