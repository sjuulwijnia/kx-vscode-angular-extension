'use strict';
import * as fs from 'fs';
import * as vscode from 'vscode';

import {
	AngularComponentCreator,
	AngularDirectiveCreator,
	AngularModuleCreator,
	AngularPipeCreator,
	AngularServiceCreator,

	AngularCreatorInjects
} from './angular';

import {
	AngularConfigurationWatcher,
	EditorConfigurationWatcher,
	VisualStudioCodeConfigurationWatcher
} from './config-watchers';

export function activate(context: vscode.ExtensionContext) {
	const injects: AngularCreatorInjects = {
		context,
		angularConfigurationWatcher: AngularConfigurationWatcher.initialize(context),
		editorConfigurationWatcher: EditorConfigurationWatcher.initialize(context),
		vscodeConfigurationWatcher: VisualStudioCodeConfigurationWatcher.initialize(context)
	};

	const angularComponentCreator = new AngularComponentCreator(injects);
	const angularDirectiveCreator = new AngularDirectiveCreator(injects);
	const angularModuleCreator = new AngularModuleCreator(injects, angularComponentCreator);
	const angularPipeCreator = new AngularPipeCreator(injects);
	const angularServiceCreator = new AngularServiceCreator(injects);
}

export function deactivate(a) {
	console.log('deactivate!', a);
}
