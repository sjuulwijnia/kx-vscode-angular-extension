'use strict';
import { AngularCliDirectiveConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createDirectiveTemplateCode(angularServiceConfiguration: AngularCliDirectiveConfiguration, angularSelector: AngularSelector) {
	const directiveImports: string[] = [
		'Directive'
	];

	return directiveTemplateCode
		.replace(new RegExp(DIRECTIVE_CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(DIRECTIVE_NAME_REPLACE, 'gm'), angularSelector.directive)
		.replace(new RegExp(DIRECTIVE_IMPORTS_REPLACE, 'gm'), directiveImports.join(', '));
}

const DIRECTIVE_CLASS_REPLACE = '##DIRECTIVE_CLASS_REPLACE';
const DIRECTIVE_IMPORTS_REPLACE = '##DIRECTIVE_IMPORTS_REPLACE';
const DIRECTIVE_NAME_REPLACE = '##DIRECTIVE_NAME_REPLACE';

const directiveTemplateCode = `import { ${DIRECTIVE_IMPORTS_REPLACE} } from '@angular/core';

@Directive({
  selector: '[${DIRECTIVE_NAME_REPLACE}]'
})
export class ${DIRECTIVE_CLASS_REPLACE} {

  constructor() { }

}`
