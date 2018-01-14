'use strict';

import { BaseSelector } from '../base-selector';

export class TypescriptSelector extends BaseSelector {
	public get clazz(): string {
		return this.capitalize(this.getClass());
	}

	public get filename(): string {
		return `${this.getHyphenated()}`;
	}

	constructor(
		input: string
	) {
		super(input);
	}
}
