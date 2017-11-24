'use strict';
import * as ec from 'editorconfig-parser';

import { BaseConfigWatcher } from './base-config-watcher';

export class EditorConfigurationWatcher extends BaseConfigWatcher<EditorConfiguration> {
	public get indenting(): string {
		if (this.currentConfiguration.indent_style === 'tab') {
			return '\t';
		}

		return ' '.repeat(+this.currentConfiguration.indent_size);
	}

	private static _instance: EditorConfigurationWatcher = new EditorConfigurationWatcher();
	public static get instance(): EditorConfigurationWatcher {
		return EditorConfigurationWatcher._instance;
	}

	private constructor() {
		super('.editorconfig');
	}

	public makeCompliant(data: string): string {
		if (this.currentConfiguration.insert_final_newline === 'true' && !data.endsWith('\n')) {
			data += '\n';
		}

		return data.replace(/\t/gmi, this.indenting);
	}

	protected triggerConfigurationUpdate(editorConfig: string) {
		const parsedConfiguration = ec.parse(editorConfig);
		this.setCurrentConfiguration({
			...parsedConfiguration['*'],
			...(parsedConfiguration['*.ts'] || {})
		});

		this.triggerCallbacks();
	}

	protected triggerConfigurationDelete() {

	}
}

export interface EditorConfiguration {
	charset: string;
	indent_style: "space" | "tab";
	indent_size: string;
	insert_final_newline: "true" | "false";
}
