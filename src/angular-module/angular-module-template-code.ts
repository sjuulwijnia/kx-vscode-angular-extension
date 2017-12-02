'use strict';
import { AngularCliModuleConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createModuleTemplateCode(angularModuleConfiguration: AngularCliModuleConfiguration, angularSelector: AngularSelector) {
	const moduleImports: string[] = [
		'NgModule'
	];

	return moduleTemplateCode
		.replace(new RegExp(CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(IMPORTS_REPLACE, 'gm'), moduleImports.join(', '));
}

const CLASS_REPLACE = '##CLASS_REPLACE';
const IMPORTS_REPLACE = '##IMPORTS_REPLACE';

const moduleTemplateCode = `import { ${IMPORTS_REPLACE} } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [

	],
	providers: [

	],
	exports: [

	]
})
export class ${CLASS_REPLACE} { }`
