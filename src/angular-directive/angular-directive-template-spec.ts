'use strict';
import { AngularCliDirectiveConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createDirectiveTemplateSpec(angularPipeConfiguration: AngularCliDirectiveConfiguration, angularSelector: AngularSelector) {
	return directiveTemplateSpec
		.replace(new RegExp(DIRECTIVE_CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(DIRECTIVE_FILE_REPLACE, 'gm'), angularSelector.filename);
}

const DIRECTIVE_CLASS_REPLACE = '##DIRECTIVE_CLASS_REPLACE';
const DIRECTIVE_FILE_REPLACE = '##DIRECTIVE_FILE_REPLACE';

const directiveTemplateSpec = `import { ${DIRECTIVE_CLASS_REPLACE} } from './${DIRECTIVE_FILE_REPLACE}';

describe('${DIRECTIVE_CLASS_REPLACE}', () => {
  it('should create an instance', () => {
    const directive = new ${DIRECTIVE_CLASS_REPLACE}();
    expect(directive).toBeTruthy();
  });
});`
