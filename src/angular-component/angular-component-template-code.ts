'use strict';
import { AngularCliComponentConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createComponentTemplateCode(angularComponentConfiguration: AngularCliComponentConfiguration, angularSelector: AngularSelector, styleExtension: string = 'css') {
	const componentOptions: string[] = [
		`selector: '${angularSelector.component}'`
	];
	const componentImports: string[] = [
		'Component'
	];

	if (angularComponentConfiguration.inlineTemplate) {
		componentOptions.push(`template: \`<div>${angularSelector.component} works!</div>\``);
	} else {
		componentOptions.push(`templateUrl: './${angularSelector.filename}.html'`)
	}

	if (angularComponentConfiguration.inlineStyle) {
		componentOptions.push(`styles: [ ':host { }' ]`);
	} else {
		componentOptions.push(`styleUrls: [ './${angularSelector.filename}.${styleExtension}' ]`)
	}

	switch (angularComponentConfiguration.changeDetection) {
		case 'OnPush':
			componentOptions.push(`changeDetection: ChangeDetectionStrategy.${angularComponentConfiguration.changeDetection}`);
			componentImports.push('ChangeDetectionStrategy');
			break;

		default: break;
	}

	switch (angularComponentConfiguration.viewEncapsulation) {
		case 'Native':
		case 'None':
			componentOptions.push(`encapsulation: ViewEncapsulation.${angularComponentConfiguration.viewEncapsulation}`);
			componentImports.push('ViewEncapsulation');
			break;

		default: break;
	}

	return componentTemplateCode
		.replace(new RegExp(COMPONENT_CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(COMPONENT_IMPORTS_REPLACE, 'gm'), componentImports.join(', '))
		.replace(new RegExp(COMPONENT_OPTIONS_REPLACE, 'gm'), componentOptions.join(',\n\t'));
}

const COMPONENT_CLASS_REPLACE = 'SERVICE_CLASS_REPLACE';
const COMPONENT_IMPORTS_REPLACE = '##COMPONENT_IMPORTS_REPLACE';
const COMPONENT_OPTIONS_REPLACE = '##COMPONENT_OPTIONS_REPLACE';

const componentTemplateCode = `import { ${COMPONENT_IMPORTS_REPLACE} } from '@angular/core';

@Component({
	${COMPONENT_OPTIONS_REPLACE}
})
export class ${COMPONENT_CLASS_REPLACE} {

}`
