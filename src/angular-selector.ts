'use strict';

export class AngularSelector {
	public get clazz(): string {
		const clazz = this.pipe;
		if (!clazz) {
			return '';
		}

		return `${this.capitalize(clazz)}${this.capitalize(this.suffix)}`;
	}

	public get component(): string {
		if (!this.input) {
			return '';
		}

		let selector = this.input
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

	public get filename(): string {
		return `${this.component}.${this.suffix.toLowerCase()}`.substring(this.prefix.length + 1);
	}

	public get pipe(): string {
		if (!this.input) {
			return '';
		}

		let pipe = this.input
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

	constructor(
		private readonly input: string,
		private readonly prefix: string = '',
		private readonly suffix: string = ''
	) { }

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
