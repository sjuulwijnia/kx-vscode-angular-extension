'use strict';
import { AngularCliServiceConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createServiceTemplateCode(angularServiceConfiguration: AngularCliServiceConfiguration, angularSelector: AngularSelector) {
	const serviceImports: string[] = [
		'Injectable'
	];

	return serviceTemplateCode
		.replace(new RegExp(SERVICE_CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(SERVICE_IMPORTS_REPLACE, 'gm'), serviceImports.join(', '));
}

const SERVICE_CLASS_REPLACE = '##SERVICE_CLASS_REPLACE';
const SERVICE_IMPORTS_REPLACE = '##SERVICE_IMPORTS_REPLACE';

const serviceTemplateCode = `import { ${SERVICE_IMPORTS_REPLACE} } from '@angular/core';

@Injectable()
export class ${SERVICE_CLASS_REPLACE} {

}`
