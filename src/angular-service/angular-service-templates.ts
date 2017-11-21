'use strict';
import { AngularCliServiceConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createServiceCode(angularServiceConfiguration: AngularCliServiceConfiguration, angularSelector: AngularSelector) {
	const serviceImports: string[] = [
		'Injectable'
	];

	return serviceCodeTemplate
		.replace(SERVICE_CLASS_REPLACE, angularSelector.clazz)
		.replace(SERVICE_IMPORTS_REPLACE, serviceImports.join(', '));
}

const SERVICE_CLASS_REPLACE = '$$COMPONENT_CLASS_REPLACE';
const SERVICE_IMPORTS_REPLACE = '$$COMPONENT_IMPORTS_REPLACE';

const serviceCodeTemplate = `import { ${SERVICE_IMPORTS_REPLACE} } from '@angular/core';

@Injectable()
export class ${SERVICE_CLASS_REPLACE} {

}`
