'use strict';

export class AngularSelector {
	public readonly clazz: string;
	public readonly component: string;
	public readonly directive: string;
	public readonly filename: string;

	constructor(
		private readonly input: string,
		private readonly prefix: string = '',
		private readonly suffix: string = ''
	) {
		this.clazz = this.convertToClass();
		this.component = this.convertToComponentSelector();
		this.directive = this.convertToDirectiveSelector();
		this.filename = this.convertToFilename();
	}

	private capitalize(input: string): string {
		if (!input) {
			return '';
		}

		return input.charAt(0).toUpperCase() + input.slice(1);
	}

	private convertToClass(): string {
		if (!this.input) {
			return '';
		}

		let clazz = this.input
			.split('-')
			.map(s => this.capitalize(s))
			.join('')
			.split(' ')
			.map(s => this.capitalize(s))
			.join('');

		const prefixIndex = clazz.indexOf(`${this.capitalize(this.prefix)}`);
		if (prefixIndex === 0) {
			clazz = clazz.substring(this.prefix.length);
		}

		return `${clazz}${this.capitalize(this.suffix)}`;
	}

	private convertToComponentSelector(): string {
		if (!this.input) {
			return '';
		}

		let selector = this.input
			.split(/(?=[A-Z])/)
			.join('-')
			.replace(/ /, '-')
			.toLowerCase();

		const prefixIndex = selector.indexOf(`${this.prefix.toLowerCase()}-`);
		if (prefixIndex === 0) {
			selector = selector.substring(this.prefix.length + 1);
		}

		return `${this.prefix.toLowerCase()}-${selector}`;
	}

	private convertToDirectiveSelector(): string {
		return `${this.prefix.toLowerCase()}${this.convertToClass()}`;
	}

	private convertToFilename(): string {
		return `${this.convertToComponentSelector()}.${this.suffix.toLowerCase()}`.substring(this.prefix.length + 1);
	}
}
