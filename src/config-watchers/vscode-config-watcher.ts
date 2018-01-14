'use strict';
import * as vscode from 'vscode';

import { BaseConfigWatcher } from './base-config-watcher';

export class VisualStudioCodeConfigurationWatcher extends BaseConfigWatcher<ExtensionConfiguration> {
	private static instance: VisualStudioCodeConfigurationWatcher = new VisualStudioCodeConfigurationWatcher();

	private constructor() {
		super('.vscode/settings.json');
	}

	public static initialize(context: vscode.ExtensionContext) {
		return VisualStudioCodeConfigurationWatcher.instance.initialize(context);
	}

	protected triggerConfigurationUpdate(vscodeConfigurationJson: string) {
		const vscodeConfiguration = JSON.parse(vscodeConfigurationJson) as VSCodeConfiguration;
		let extensionConfiguration = vscodeConfiguration['kx-vscode-angular-context-creator'];
		if (!extensionConfiguration) {
			extensionConfiguration = <ExtensionConfiguration>{
				global: {
					openCreatedFile: true
				},

				angular: {
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
				},

				typescript: {
					showClassInContextMenu: false,
					showEnumInContextMenu: false,
					showInterfaceInContextMenu: false
				}
			};
		} else {
			// global extension configuration
			extensionConfiguration.global = extensionConfiguration.global || {
				openCreatedFile: true
			};

			// angular extension configuration
			extensionConfiguration.angular = extensionConfiguration.angular || {
				component: null,
				directive: null,
				module: null,
				pipe: null,
				service: null
			};
			extensionConfiguration.angular.component = extensionConfiguration.angular.component || {
				addToModule: true,
				containerBarrelFile: false,
				containerSuffix: false
			};
			extensionConfiguration.angular.directive = extensionConfiguration.angular.directive || {
				addToModule: true,
				containerBarrelFile: false,
				containerSuffix: false
			};
			extensionConfiguration.angular.module = extensionConfiguration.angular.module || {
				addToModule: false,
				containerBarrelFile: false,
				containerSuffix: false,
				createModuleComponent: true
			};
			extensionConfiguration.angular.pipe = extensionConfiguration.angular.pipe || {
				addToModule: true,
				containerBarrelFile: false,
				containerSuffix: false
			};
			extensionConfiguration.angular.service = extensionConfiguration.angular.service || {
				addToModule: true,
				containerBarrelFile: false,
				containerSuffix: false
			};

			// typescript extension configuration
			extensionConfiguration.typescript = extensionConfiguration.typescript || {
				showClassInContextMenu: false,
				showEnumInContextMenu: false,
				showInterfaceInContextMenu: false
			};
		}

		this.setCurrentConfiguration(extensionConfiguration);

		this.triggerCallbacks();
	}

	protected triggerConfigurationDelete() {

	}
}

export interface VSCodeConfiguration {
	"kx-vscode-angular-context-creator": ExtensionConfiguration;
}

export interface ExtensionConfiguration {
	global: ExtensionGlobalConfiguration;

	angular: ExtensionAngularConfiguration;
	typescript: ExtensionTypescriptConfiguration;
}

export interface ExtensionGlobalConfiguration {
	openCreatedFile: boolean;
}

export interface ExtensionAngularConfiguration {
	component: ExtensionComponentConfiguration;
	directive: ExtensionDirectiveConfiguration;
	module: ExtensionModuleConfiguration;
	pipe: ExtensionPipeConfiguration;
	service: ExtensionServiceConfiguration;
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
	createModuleComponent?: boolean;
}
export interface ExtensionPipeConfiguration extends ExtensionDefaultOptionConfiguration {

}
export interface ExtensionServiceConfiguration extends ExtensionDefaultOptionConfiguration {

}

export interface ExtensionTypescriptConfiguration {
	showClassInContextMenu: boolean;
	showEnumInContextMenu: boolean;
	showInterfaceInContextMenu: boolean;
}
