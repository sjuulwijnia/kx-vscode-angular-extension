'use strict';
import { AngularCliPipeConfiguration } from '../config-watchers';
import { AngularSelector } from '../angular-selector';

export function createPipeTemplateSpec(angularPipeConfiguration: AngularCliPipeConfiguration, angularSelector: AngularSelector) {
	return pipeTemplateSpec
		.replace(new RegExp(PIPE_CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(PIPE_FILE_REPLACE, 'gm'), angularSelector.filename);
}

const PIPE_CLASS_REPLACE = '##PIPE_CLASS_REPLACE';
const PIPE_FILE_REPLACE = '##PIPE_FILE_REPLACE';

const pipeTemplateSpec = `import { ${PIPE_CLASS_REPLACE} } from './${PIPE_FILE_REPLACE}';

describe('${PIPE_CLASS_REPLACE}', () => {
  it('create an instance', () => {
    const pipe = new ${PIPE_CLASS_REPLACE}();
    expect(pipe).toBeTruthy();
  });
});`
