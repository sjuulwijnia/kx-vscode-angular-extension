'use strict';
import { AngularCliDirectiveConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createDirectiveTemplateSpec(angularPipeConfiguration: AngularCliDirectiveConfiguration, angularSelector: AngularSelector) {
	return directiveTemplateSpec
		.replace(new RegExp(CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(FILE_REPLACE, 'gm'), angularSelector.filename);
}

const CLASS_REPLACE = '##CLASS_REPLACE';
const FILE_REPLACE = '##FILE_REPLACE';

const directiveTemplateSpec = `import { ${CLASS_REPLACE} } from './${FILE_REPLACE}';

describe('${CLASS_REPLACE}', () => {
  it('should create an instance', () => {
    const directive = new ${CLASS_REPLACE}();
    expect(directive).toBeTruthy();
  });
});`
