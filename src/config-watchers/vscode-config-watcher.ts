'use strict';
import * as vscode from 'vscode';

import { BaseConfigWatcher } from './base-config-watcher';

export class VisualStudioCodeConfigurationWatcher extends BaseConfigWatcher<ExtensionConfiguration> {
	private static _instance: VisualStudioCodeConfigurationWatcher = new VisualStudioCodeConfigurationWatcher();
	public static get instance(): VisualStudioCodeConfigurationWatcher {
		return VisualStudioCodeConfigurationWatcher._instance;
	}

	private constructor() {
		super('.vscode/settings.json');
	}

	protected triggerConfigurationUpdate(vscodeConfigurationJson: string) {
		const vscodeConfiguration = JSON.parse(vscodeConfigurationJson) as VSCodeConfiguration;
		let extensionConfiguration = vscodeConfiguration['kx-vscode-angular-extension'];
		if (!extensionConfiguration) {
			extensionConfiguration = <ExtensionConfiguration>{
				global: {
					openCreatedFile: true
				},
				component: {
					addToModule: true,
					containerBarrelFile: false,
					containerSuffix: false
				},
				directive: {
					addToModule: true,
					containerBarrelFile: false,
					containerSuffix: false
				},
				module: {
					addToModule: false,
					containerBarrelFile: false,
					containerSuffix: false
				},
				pipe: {
					addToModule: true,
					containerBarrelFile: false,
					containerSuffix: false
				},
				service: {
					addToModule: true,
					containerBarrelFile: false,
					containerSuffix: false
				}
			}
		} else {
			extensionConfiguration.global = extensionConfiguration.global || {
				openCreatedFile: true
			};
			extensionConfiguration.component = extensionConfiguration.component || {
				addToModule: true,
				containerBarrelFile: false,
				containerSuffix: false
			};
			extensionConfiguration.directive = extensionConfiguration.directive || {
				addToModule: true,
				containerBarrelFile: false,
				containerSuffix: false
			};
			extensionConfiguration.module = extensionConfiguration.module || {
				addToModule: false,
				containerBarrelFile: false,
				containerSuffix: false
			};
			extensionConfiguration.pipe = extensionConfiguration.pipe || {
				addToModule: true,
				containerBarrelFile: false,
				containerSuffix: false
			};
			extensionConfiguration.service = extensionConfiguration.service || {
				addToModule: true,
				containerBarrelFile: false,
				containerSuffix: false
			};
		}

		this.setCurrentConfiguration(extensionConfiguration);

		this.triggerCallbacks();
	}

	protected triggerConfigurationDelete() {

	}
}

export interface VSCodeConfiguration {
	"kx-vscode-angular-extension": ExtensionConfiguration;
}

export interface ExtensionConfiguration {
	global: ExtensionGlobalConfiguration;

	component: ExtensionComponentConfiguration;
	directive: ExtensionDirectiveConfiguration;
	module: ExtensionModuleConfiguration;
	pipe: ExtensionPipeConfiguration;
	service: ExtensionServiceConfiguration;
}

export interface ExtensionGlobalConfiguration {
	openCreatedFile: boolean;
}

export interface ExtensionDefaultOptionConfiguration {
	addToModule?: boolean;
	containerBarrelFile?: boolean;
	containerSuffix?: boolean;
}

export interface ExtensionComponentConfiguration extends ExtensionDefaultOptionConfiguration {

}
export interface ExtensionDirectiveConfiguration extends ExtensionDefaultOptionConfiguration {

}
export interface ExtensionModuleConfiguration extends ExtensionDefaultOptionConfiguration {

}
export interface ExtensionPipeConfiguration extends ExtensionDefaultOptionConfiguration {

}
export interface ExtensionServiceConfiguration extends ExtensionDefaultOptionConfiguration {

}
