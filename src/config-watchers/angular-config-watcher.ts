'use strict';
import { BaseConfigWatcher } from './base-config-watcher';

export class AngularConfigurationWatcher extends BaseConfigWatcher<AngularCliConfiguration> {
	private static _instance: AngularConfigurationWatcher = new AngularConfigurationWatcher();
	public static get instance(): AngularConfigurationWatcher {
		return AngularConfigurationWatcher._instance;
	}

	private constructor() {
		super('.angular-cli.json');
	}

	protected triggerConfigurationUpdate(angularConfigurationJson: string) {
		this.setCurrentConfiguration(JSON.parse(angularConfigurationJson) as AngularCliConfiguration);

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

export interface AngularCliComponentConfiguration {
	changeDetection: AngularCliComponentConfigurationChangeDetection;
	flat: boolean;
	inlineStyle: AngularCliComponentConfigurationInline;
	inlineTemplate: AngularCliComponentConfigurationInline;
	spec: boolean;
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
