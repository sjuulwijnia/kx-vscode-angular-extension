'use strict';

import { BaseSelector } from '../base-selector';

export class AngularSelector extends BaseSelector {
	public get clazz(): string {
		return `${this.capitalize(this.getClass())}${this.capitalize(this.suffix)}`;
	}

	public get component(): string {
		if (!this.inputValidated) {
			return '';
		}

		let selector = this.getHyphenated();
		let prefixIndex = selector.indexOf(`${this.prefix.toLowerCase()}-`);
		if (prefixIndex === 0) {
			selector = selector.substring(this.prefix.length + 1);
		} else {
			prefixIndex = selector.indexOf(`${this.prefix.toLowerCase()}`);
			if (prefixIndex === 0) {
				selector = selector.substring(this.prefix.length);
			}
		}

		return `${this.prefix.toLowerCase()}-${selector}`;
	}

	public get directive(): string {
		return `${this.prefix.toLowerCase()}${this.capitalize(this.pipe)}`;
	}

	public get directory(): string {
		return this.filename.replace(`.${this.suffix}`, '');
	}

	public get filename(): string {
		return `${this.component}.${this.suffix.toLowerCase()}`.substring(this.prefix.length + 1);
	}

	public get pipe(): string {
		return this.decapitalize(this.getClass());
	}

	constructor(
		input: string,
		prefix: string = '',
		suffix: string = ''
	) {
		super(input, prefix, suffix);
	}

	public toNewOption(newSuffix: string): AngularSelector {
		return new AngularSelector(this.input, this.prefix, newSuffix);
	}
}
