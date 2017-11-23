'use strict';
import { AngularCliDirectiveConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createDirectiveTemplateCode(angularServiceConfiguration: AngularCliDirectiveConfiguration, angularSelector: AngularSelector) {
	const directiveImports: string[] = [
		'Directive'
	];

	return directiveTemplateCode
		.replace(new RegExp(CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(NAME_REPLACE, 'gm'), angularSelector.directive)
		.replace(new RegExp(IMPORTS_REPLACE, 'gm'), directiveImports.join(', '));
}

const CLASS_REPLACE = '##CLASS_REPLACE';
const IMPORTS_REPLACE = '##IMPORTS_REPLACE';
const NAME_REPLACE = '##NAME_REPLACE';

const directiveTemplateCode = `import { ${IMPORTS_REPLACE} } from '@angular/core';

@Directive({
  selector: '[${NAME_REPLACE}]'
})
export class ${CLASS_REPLACE} {

  constructor() { }

}`
