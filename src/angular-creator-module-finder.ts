'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as vscode from 'vscode';

import {
	AngularCliDefaultsItemConfiguration
} from './config-watchers';

import {
	AngularCreatorSettingsAngularModuleType
} from './angular-creator-models';
import { AngularSelector } from './angular-selector';
import * as fileUtil from './file-util';
import { ScriptTarget } from 'typescript';

// TODO: move to angular-creator?
// TODO: add to import statements
// TODO: make it usuable for more than just declarations (imports & providers!)
// TODO: make compliant using .editor-config

export interface IAddToNearestNgModuleConfiguration {
	angularConfiguration: AngularCliDefaultsItemConfiguration;
	workspaceRoot: string;

	optionDirectory: string;
	optionDirectoryBarrelFile: boolean;
	optionModuleType: AngularCreatorSettingsAngularModuleType;
	optionPath: string;
	optionSelector: AngularSelector;
}

export async function addToNearestNgModule(configuration: IAddToNearestNgModuleConfiguration) {
	new AngularCreatorModuleFinder(configuration);
}

class AngularCreatorModuleFinder {
	private moduleUri: vscode.Uri = null;
	private moduleDeclarationHandled = false;
	private moduleSourceFile: ts.SourceFile = null;

	constructor(
		private readonly configuration: IAddToNearestNgModuleConfiguration
	) {
		this.addOptionToModule();
	}

	private async addOptionToModule() {
		this.moduleUri = await this.findNearestModule();

		if (!this.moduleUri) {
			vscode.window.showErrorMessage(`Couldn't add '${this.configuration.optionPath}' to a NgModule: no parent NgModule found`);
			return;
		}

		await this.handleModuleFile();
	}

	private findNearestModule() {
		return new Promise<vscode.Uri>(async resolve => {
			let directory = this.configuration.optionDirectory;
			let uri: vscode.Uri = null;
			while (!uri && !!directory && directory.indexOf(this.configuration.workspaceRoot) !== -1) {
				const searchDirectory = `${directory.replace(this.configuration.workspaceRoot, '').substr(1)}`;
				const uris = await fileUtil.findFiles(`${searchDirectory}${path.sep}**${path.sep}*.module.ts`, 1);

				if (uris.length > 0) {
					uri = uris[0];
				} else {
					directory = path.resolve(directory, '..');
				}
			}

			resolve(uri);
		});
	}

	private findNgModuleDecorator(node: ts.Node): ts.Decorator {
		if (ts.isDecorator(node)) {
			const callExpression = node.expression;
			if (ts.isCallExpression(callExpression)) {
				const identifier = callExpression.expression;
				if (ts.isIdentifier(identifier) && identifier.escapedText === 'NgModule') {
					return node;
				}
			}
		}

		let foundNode: ts.Decorator = null;
		ts.forEachChild(node, child => {
			foundNode = foundNode || this.findNgModuleDecorator(child);
		});

		return foundNode;
	}

	private findLastImportStatement(node: ts.Node): ts.ImportDeclaration {
		if (ts.isImportDeclaration(node)) {
			return node;
		}

		let foundNode: ts.ImportDeclaration = null;
		ts.forEachChild(node, child => {
			foundNode = this.findLastImportStatement(child) || foundNode;
		});

		return foundNode;
	}

	private handleModuleFile() {
		return new Promise(resolve => {
			fs.readFile(this.moduleUri.fsPath, `utf-8`, async (error, data) => {
				if (!!error) {
					vscode.window.showErrorMessage(`Couldn't add '${this.configuration.optionPath}' to '${this.moduleUri.fsPath}': file could not be opened`);
					resolve();
					return;
				}

				this.moduleSourceFile = ts.createSourceFile(`module.ts`, data.toString(), ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

				const ngModuleDecorator = this.findNgModuleDecorator(this.moduleSourceFile);
				if (!ngModuleDecorator) {
					vscode.window.showErrorMessage(`Couldn't add '${this.configuration.optionPath}' to '${this.moduleUri.fsPath}': no @NgModule decorator found`);
					resolve();
					return;
				}

				const lastImportStatement = this.findLastImportStatement(this.moduleSourceFile);
				if (!lastImportStatement) {
					vscode.window.showErrorMessage(`Couldn't add '${this.configuration.optionPath}' to '${this.moduleUri.fsPath}': no import statement found to follow up`);
					resolve();
					return;
				}

				const workspaceEdit = new vscode.WorkspaceEdit();

				await this.handleNgModuleDeclaration(ngModuleDecorator, workspaceEdit);
				await this.handleImportStatement(lastImportStatement, workspaceEdit);

				vscode.workspace
					.openTextDocument(this.moduleUri)
					.then(document => {
						vscode.workspace
							.applyEdit(workspaceEdit)
							.then(done => {
								if (done) {
									document.save();
								}

								resolve();
							});
					});
			});
		});
	}

	private handleImportStatement(lastImportStatement: ts.ImportDeclaration, workspaceEdit: vscode.WorkspaceEdit) {
		return new Promise(resolve => {
			const relativeDestination = this.configuration.optionDirectoryBarrelFile ?
				this.configuration.optionDirectory :
				this.configuration.optionPath.replace(/\.ts$/, '');
			const relativeFrom = fileUtil.getDirectoryFromUri(this.moduleUri);

			const relative = path
				.relative(relativeFrom, relativeDestination)
				.replace(new RegExp(`\\${path.sep}`, 'gm'), '/');

			this.insertDocumentContents(workspaceEdit, this.moduleUri, lastImportStatement, `\nimport { ${this.configuration.optionSelector.clazz} } from './${relative}';`);

			resolve();
		});
	}

	private handleNgModuleDeclaration(ngModuleDeclaration: ts.Decorator, workspaceEdit: vscode.WorkspaceEdit) {
		return new Promise(resolve => {
			const expression = ngModuleDeclaration.expression;
			if (!ts.isCallExpression(expression)) {
				resolve();
				return;
			}

			const ngModuleConfiguration = expression.arguments[0];
			if (!ts.isObjectLiteralExpression(ngModuleConfiguration)) {
				resolve();
				return;
			}

			const ngModuleConfigurationOption = ngModuleConfiguration
				.properties
				.find(property => {
					const identifier = property.name;
					if (ts.isIdentifier(identifier)) {
						return identifier.escapedText === this.configuration.optionModuleType;
					}

					return false;
				}) as ts.PropertyAssignment;

			if (!ngModuleConfigurationOption) {
				resolve();
				return;
			}

			if (!!ngModuleConfigurationOption) {
				// use existing property in NgModule declaration

				const initializer = ngModuleConfigurationOption.initializer;
				if (ts.isArrayLiteralExpression(initializer)) {
					// it's an array! awesome

					const childCount = initializer.elements.length;

					if (childCount === 0) {
						this.replaceDocumentContents(workspaceEdit, this.moduleUri, initializer, ` [\n\t\t${this.configuration.optionSelector.clazz}\n\t]`)
					} else {
						const lastChild = initializer.elements[childCount - 1];

						this.insertDocumentContents(workspaceEdit, this.moduleUri, lastChild, `,\n\t\t${this.configuration.optionSelector.clazz}`)
					}
				} else {
					// TODO: other possibilities than null / undefined?
					if (initializer.kind === ts.SyntaxKind.NullKeyword || this.isUndefinedKeyword(initializer)) {
						this.replaceDocumentContents(workspaceEdit, this.moduleUri, initializer, ` [\n\t\t${this.configuration.optionSelector.clazz}\n\t]`)
					}
				}
			} else {
				// TODO: create property in NgModule declaration
			}

			resolve();
		});
	}

	private insertDocumentContents(workspaceEdit: vscode.WorkspaceEdit, uri: vscode.Uri, referenceNode: ts.Node, content: string) {
		workspaceEdit.insert(uri, this.convertNodePositionToVisualStudioCodePosition(referenceNode.end), content);
	}

	private replaceDocumentContents(workspaceEdit: vscode.WorkspaceEdit, uri: vscode.Uri, replaceNode: ts.Node, content: string) {
		const startPosition = this.convertNodePositionToVisualStudioCodePosition(replaceNode.pos);
		const endPosition = this.convertNodePositionToVisualStudioCodePosition(replaceNode.end);

		workspaceEdit.replace(uri, new vscode.Range(startPosition, endPosition), content);
	}

	private convertNodePositionToVisualStudioCodePosition(i: number): vscode.Position {
		const position = this.moduleSourceFile.getLineAndCharacterOfPosition(i);

		return new vscode.Position(position.line, position.character);
	}

	private isUndefinedKeyword(node: ts.Node) {
		return (ts.isIdentifier(node) && node.originalKeywordKind === ts.SyntaxKind.UndefinedKeyword && node.escapedText === 'undefined');
	}
}
