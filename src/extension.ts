'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

import { AngularCreatorInjects } from './angular-creator';
import { AngularComponentCreator } from './angular-component';
import { AngularDirectiveCreator } from './angular-directive';
import { AngularPipeCreator } from './angular-pipe';
import { AngularServiceCreator } from './angular-service';

import { AngularConfigurationWatcher, EditorConfigurationWatcher } from './config-watchers';

const configuration = vscode.workspace.getConfiguration('kx-vscode-angular-extension');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const injects: AngularCreatorInjects = {
		context,
		angularConfigurationWatcher: AngularConfigurationWatcher.instance,
		editorConfigurationWatcher: EditorConfigurationWatcher.instance
	};

	injects.angularConfigurationWatcher.initialize(context);
	injects.editorConfigurationWatcher.initialize(context);

	const angularComponentCreator = new AngularComponentCreator(injects);
	const angularDirectiveCreator = new AngularDirectiveCreator(injects);
	const angularPipeCreator = new AngularPipeCreator(injects);
	const angularServiceCreator = new AngularServiceCreator(injects);

	// const disposable = vscode.commands.registerCommand('kx-vscode-angular-extension.createAngularObject', promptForCreationType);

	// context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
