'use strict';

export abstract class BaseSelector {
	public abstract get clazz(): string;
	public abstract get filename(): string;

	protected readonly inputValidated: string = null;
	public get inputInvalid(): BaseSelectorInvalidEnum {
		if (/^\d/gmi.test(this.clazz)) {
			return BaseSelectorInvalidEnum.ERROR_STARTS_WITH_NUMBER;
		}

		if (this.inputValidated !== this.input) {
			return BaseSelectorInvalidEnum.ERROR_INVALID_CHARACTERS;
		}

		return BaseSelectorInvalidEnum.OK;
	}

	constructor(
		public readonly input: string,
		protected readonly prefix: string = '',
		protected readonly suffix: string = ''
	) {
		this.inputValidated = input
			.split(/[\<\>\:\;\'\"\/\\\|\?\*\.\_\[\]\{\}\(\)]/gmi)
			.join('-');
	}

	protected capitalize(input: string): string {
		if (!input) {
			return '';
		}

		return input.charAt(0).toUpperCase() + input.slice(1);
	}

	protected decapitalize(input: string): string {
		if (!input) {
			return '';
		}

		return input.charAt(0).toLowerCase() + input.slice(1);
	}

	protected getClass(): string {
		if (!this.inputValidated) {
			return '';
		}

		let clazz = this.inputValidated
			.split('-')
			.map(s => this.capitalize(s))
			.join('')
			.split(' ')
			.map(s => this.capitalize(s))
			.join('');

		// remove the prefix if it's there, it is not needed for a class name
		const prefixIndex = clazz.indexOf(`${this.capitalize(this.prefix)}`);
		if (prefixIndex === 0) {
			clazz = clazz.substring(this.prefix.length);
		}

		return clazz;
	}

	protected getHyphenated(): string {
		if (!this.inputValidated) {
			return '';
		}

		return this.inputValidated
			.split(/(?=[A-Z])/)
			.join('-')
			.replace(/ /, '-')
			.toLowerCase();
	}
}

export enum BaseSelectorInvalidEnum {
	OK = 0,
	ERROR_STARTS_WITH_NUMBER = 10,
	ERROR_INVALID_CHARACTERS
}
