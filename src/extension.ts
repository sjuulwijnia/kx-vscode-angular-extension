'use strict';
import * as fs from 'fs';
import * as vscode from 'vscode';

import { BaseCreatorInjects } from './base-creator';

import {
	AngularComponentCreator,
	AngularDirectiveCreator,
	AngularModuleCreator,
	AngularPipeCreator,
	AngularServiceCreator,

	AngularCreatorInjects
} from './angular';

import {
	TypescriptCreator,
	TypescriptCreatorInjects
} from './typescript';

import {
	AngularConfigurationWatcher,
	EditorConfigurationWatcher,
	VisualStudioCodeConfigurationWatcher
} from './config-watchers';

export function activate(context: vscode.ExtensionContext) {
	const baseInjects: BaseCreatorInjects = {
		context,
		editorConfigurationWatcher: EditorConfigurationWatcher.initialize(context),
		vscodeConfigurationWatcher: VisualStudioCodeConfigurationWatcher.initialize(context)
	};

	const angularInjects: AngularCreatorInjects = {
		...baseInjects,
		angularConfigurationWatcher: AngularConfigurationWatcher.initialize(context),
	};

	const typescriptInjects: TypescriptCreatorInjects = {
		...baseInjects
	};

	const angularComponentCreator = new AngularComponentCreator(angularInjects);
	const angularDirectiveCreator = new AngularDirectiveCreator(angularInjects);
	const angularModuleCreator = new AngularModuleCreator(angularInjects, angularComponentCreator);
	const angularPipeCreator = new AngularPipeCreator(angularInjects);
	const angularServiceCreator = new AngularServiceCreator(angularInjects);

	const typescriptClassCreator = new TypescriptCreator('class', typescriptInjects);
	const typescriptEnumCreator = new TypescriptCreator('enum', typescriptInjects);
	const typescriptInterfaceCreator = new TypescriptCreator('interface', typescriptInjects);
}

export function deactivate() {

}
