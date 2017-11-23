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
