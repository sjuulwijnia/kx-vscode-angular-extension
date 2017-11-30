import * as vscode from 'vscode';

import {
	AngularConfigurationWatcher,
	EditorConfigurationWatcher
} from './config-watchers';

export interface AngularCreatorSettings {
	angularType: string;
	angularModuleType: AngularCreatorSettingsAngularModuleType;

	command: string;

	selectorPrompt: string;
	selectorPromptAppendPrefix: AngularCreatorSettingsAppendPrefixType;
}

export type AngularCreatorSettingsAppendPrefixType = true | false | 'short';
export type AngularCreatorSettingsAngularModuleType = 'declarations' | 'imports' | 'providers';

export interface AngularCreatorInjects {
	context: vscode.ExtensionContext;

	angularConfigurationWatcher: AngularConfigurationWatcher;
	editorConfigurationWatcher: EditorConfigurationWatcher;
}

