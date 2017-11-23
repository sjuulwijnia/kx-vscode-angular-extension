'use strict';
import { AngularCliPipeConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createPipeTemplateCode(angularServiceConfiguration: AngularCliPipeConfiguration, angularSelector: AngularSelector) {
	const pipeImports: string[] = [
		'Pipe',
		'PipeTransform'
	];

	return pipeTemplateCode
		.replace(new RegExp(PIPE_CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(PIPE_NAME_REPLACE, 'gm'), angularSelector.pipe)
		.replace(new RegExp(PIPE_IMPORTS_REPLACE, 'gm'), pipeImports.join(', '));
}

const PIPE_CLASS_REPLACE = '##PIPE_CLASS_REPLACE';
const PIPE_IMPORTS_REPLACE = '##PIPE_IMPORTS_REPLACE';
const PIPE_NAME_REPLACE = '##PIPE_NAME_REPLACE';

const pipeTemplateCode = `import { ${PIPE_IMPORTS_REPLACE} } from '@angular/core';

@Pipe({
  name: '${PIPE_NAME_REPLACE}'
})
export class ${PIPE_CLASS_REPLACE} implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}`
