'use strict';
import { ComponentConfiguration } from './angular-component-configuration';
import { AngularSelector } from '../angular-selector';

export function createComponentTemplateCode(componentConfiguration: ComponentConfiguration, angularSelector: AngularSelector, styleExtension: string = 'css') {
	const componentOptions: string[] = [
		`selector: '${angularSelector.component}'`
	];
	const componentImports: string[] = [
		'Component'
	];

	if (componentConfiguration.inlineTemplate) {
		componentOptions.push(`template: \`<div>${angularSelector.component} works!</div>\``);
	} else {
		componentOptions.push(`templateUrl: './${angularSelector.filename}.html'`)
	}

	if (componentConfiguration.inlineStyle) {
		componentOptions.push(`styles: [ ':host { }' ]`);
	} else {
		componentOptions.push(`styleUrls: [ './${angularSelector.filename}.${styleExtension}' ]`)
	}

	switch (componentConfiguration.changeDetection) {
		case 'OnPush':
			componentOptions.push(`changeDetection: ChangeDetectionStrategy.${componentConfiguration.changeDetection}`);
			componentImports.push('ChangeDetectionStrategy');
			break;

		default: break;
	}

	switch (componentConfiguration.viewEncapsulation) {
		case 'Native':
		case 'None':
			componentOptions.push(`encapsulation: ViewEncapsulation.${componentConfiguration.viewEncapsulation}`);
			componentImports.push('ViewEncapsulation');
			break;

		default: break;
	}

	return componentTemplateCode
		.replace(new RegExp(CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(IMPORTS_REPLACE, 'gm'), componentImports.join(', '))
		.replace(new RegExp(OPTIONS_REPLACE, 'gm'), componentOptions.join(',\n\t'));
}

const CLASS_REPLACE = '##CLASS_REPLACE';
const IMPORTS_REPLACE = '##IMPORTS_REPLACE';
const OPTIONS_REPLACE = '##OPTIONS_REPLACE';

const componentTemplateCode = `import { ${IMPORTS_REPLACE} } from '@angular/core';

@Component({
	${OPTIONS_REPLACE}
})
export class ${CLASS_REPLACE} {

}`
