'use strict';
import { PipeConfiguration } from './angular-pipe-configuration';
import { AngularSelector } from '../angular-selector';

export function createPipeTemplateCode(pipeConfiguration: PipeConfiguration, angularSelector: AngularSelector) {
	const pipeImports: string[] = [
		'Pipe',
		'PipeTransform'
	];

	return pipeTemplateCode
		.replace(new RegExp(CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(NAME_REPLACE, 'gm'), angularSelector.pipe)
		.replace(new RegExp(IMPORTS_REPLACE, 'gm'), pipeImports.join(', '));
}

const CLASS_REPLACE = '##CLASS_REPLACE';
const IMPORTS_REPLACE = '##IMPORTS_REPLACE';
const NAME_REPLACE = '##NAME_REPLACE';

const pipeTemplateCode = `import { ${IMPORTS_REPLACE} } from '@angular/core';

@Pipe({
  name: '${NAME_REPLACE}'
})
export class ${CLASS_REPLACE} implements PipeTransform {
  transform(value: any, args?: any): any {
    return null;
  }
}`
