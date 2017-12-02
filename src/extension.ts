'use strict';
import * as fs from 'fs';
import * as vscode from 'vscode';

import { AngularCreatorInjects } from './angular-creator-models';
import { AngularComponentCreator } from './angular-component';
import { AngularDirectiveCreator } from './angular-directive';
import { AngularModuleCreator } from './angular-module';
import { AngularPipeCreator } from './angular-pipe';
import { AngularServiceCreator } from './angular-service';

import {
	AngularConfigurationWatcher,
	EditorConfigurationWatcher,
	VisualStudioCodeConfigurationWatcher
} from './config-watchers';

export function activate(context: vscode.ExtensionContext) {
	const injects: AngularCreatorInjects = {
		context,
		angularConfigurationWatcher: AngularConfigurationWatcher.instance,
		editorConfigurationWatcher: EditorConfigurationWatcher.instance,
		vscodeConfigurationWatcher: VisualStudioCodeConfigurationWatcher.instance
	};

	injects.angularConfigurationWatcher.initialize(context);
	injects.editorConfigurationWatcher.initialize(context);
	injects.vscodeConfigurationWatcher.initialize(context);

	const angularComponentCreator = new AngularComponentCreator(injects);
	const angularDirectiveCreator = new AngularDirectiveCreator(injects);
	const angularModuleCreator = new AngularModuleCreator(injects);
	const angularPipeCreator = new AngularPipeCreator(injects);
	const angularServiceCreator = new AngularServiceCreator(injects);
}

export function deactivate() {

}
