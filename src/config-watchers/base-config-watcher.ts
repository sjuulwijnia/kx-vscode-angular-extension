import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export type BaseConfigurationCallback<CONFIGURATION> = (configuration: CONFIGURATION) => void;
export abstract class BaseConfigWatcher<CONFIGURATION> {
	private initialized = false;

	private callbacks: BaseConfigurationCallback<CONFIGURATION>[] = [];
	private _currentConfiguration: CONFIGURATION = null;

	public get currentConfiguration() {
		return this._currentConfiguration;
	}

	protected constructor(
		private readonly filename: string
	) { }

	protected abstract triggerConfigurationUpdate(rawContents: string);
	protected abstract triggerConfigurationDelete();

	protected initialize(context: vscode.ExtensionContext): this {
		if (this.initialized) {
			return this;
		}

		this.initialized = true;

		const fileWatcher = vscode.workspace.createFileSystemWatcher(`**/${this.filename}`, false, false, false);

		context.subscriptions.push(fileWatcher.onDidCreate(() => this.innerTriggerConfigurationUpdate()));
		context.subscriptions.push(fileWatcher.onDidChange(() => this.innerTriggerConfigurationUpdate()));
		context.subscriptions.push(fileWatcher.onDidDelete(() => this.triggerConfigurationDelete()));
		context.subscriptions.push(fileWatcher);

		this.innerTriggerConfigurationUpdate();

		return this;
	}

	public subscribe(callback: BaseConfigurationCallback<CONFIGURATION>) {
		this.callbacks.push(callback);
		callback(this._currentConfiguration);
	}

	public getCurrentConfiguration(): CONFIGURATION {
		return this.currentConfiguration;
	}
	protected setCurrentConfiguration(configuration: CONFIGURATION) {
		this._currentConfiguration = configuration;
	}

	protected sanitizeJson(json: string) {
		return json
			.split('\n')
			.filter(s => !s.startsWith('//'))
			.join('\n');
	}

	protected triggerCallbacks() {
		this.callbacks.forEach((callback, i) => {
			callback(this._currentConfiguration);
		});
	}

	private innerTriggerConfigurationUpdate() {
		fs.readFile(`${vscode.workspace.workspaceFolders[0].uri.fsPath}/${this.filename}`, 'utf-8', (error: any, data: Buffer) => {
			try {
				this.triggerConfigurationUpdate(data.toString());
			} catch (error) {
				console.error('error!', error);
			}
		});
	}
}
