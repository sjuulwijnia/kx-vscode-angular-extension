'use strict';
import { AngularCliServiceConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createServiceTemplateCode(angularServiceConfiguration: AngularCliServiceConfiguration, angularSelector: AngularSelector) {
	const serviceImports: string[] = [
		'Injectable'
	];

	return serviceTemplateCode
		.replace(new RegExp(CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(IMPORST_REPLACE, 'gm'), serviceImports.join(', '));
}

const CLASS_REPLACE = '##CLASS_REPLACE';
const IMPORST_REPLACE = '##IMPORST_REPLACE';

const serviceTemplateCode = `import { ${IMPORST_REPLACE} } from '@angular/core';

@Injectable()
export class ${CLASS_REPLACE} {

}`
