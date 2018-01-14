'use strict';

export enum AngularSelectorInvalidEnum {
	OK = 0,
	ERROR_STARTS_WITH_NUMBER = 10,
	ERROR_INVALID_CHARACTERS
}

export class AngularSelector {
	public get clazz(): string {
		const clazz = this.pipe;
		if (!clazz) {
			return '';
		}

		return `${this.capitalize(clazz)}${this.capitalize(this.suffix)}`;
	}

	public get component(): string {
		if (!this.inputValidated) {
			return '';
		}

		let selector = this.inputValidated
			.split(/(?=[A-Z])/)
			.join('-')
			.replace(/ /, '-')
			.toLowerCase();

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
		if (!this.inputValidated) {
			return '';
		}

		let pipe = this.inputValidated
			.split('-')
			.map(s => this.capitalize(s))
			.join('')
			.split(' ')
			.map(s => this.capitalize(s))
			.join('');

		const prefixIndex = pipe.indexOf(`${this.capitalize(this.prefix)}`);
		if (prefixIndex === 0) {
			pipe = pipe.substring(this.prefix.length);
		}

		return this.decapitalize(pipe);
	}

	private readonly inputValidated: string = null;

	public get inputInvalid(): AngularSelectorInvalidEnum {
		if (/^\d/gmi.test(this.clazz)) {
			return AngularSelectorInvalidEnum.ERROR_STARTS_WITH_NUMBER;
		}

		if (this.inputValidated !== this.input) {
			return AngularSelectorInvalidEnum.ERROR_INVALID_CHARACTERS;
		}

		return AngularSelectorInvalidEnum.OK;
	}

	constructor(
		public readonly input: string,
		private readonly prefix: string = '',
		private readonly suffix: string = ''
	) {
		this.inputValidated = input
			.split(/[\<\>\:\;\'\"\/\\\|\?\*\.\_\[\]\{\}\(\)]/gmi)
			.join('-');
	}

	public toNewOption(newSuffix: string): AngularSelector {
		return new AngularSelector(this.input, this.prefix, newSuffix);
	}

	private capitalize(input: string): string {
		if (!input) {
			return '';
		}

		return input.charAt(0).toUpperCase() + input.slice(1);
	}

	private decapitalize(input: string): string {
		if (!input) {
			return '';
		}

		return input.charAt(0).toLowerCase() + input.slice(1);
	}
}
