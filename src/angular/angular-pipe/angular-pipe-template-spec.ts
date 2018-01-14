'use strict';
import { PipeConfiguration } from './angular-pipe-configuration';
import { AngularSelector } from '../angular-selector';

export function createPipeTemplateSpec(angularPipeConfiguration: PipeConfiguration, angularSelector: AngularSelector) {
	return pipeTemplateSpec
		.replace(new RegExp(CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(FILE_REPLACE, 'gm'), angularSelector.filename);
}

const CLASS_REPLACE = '##CLASS_REPLACE';
const FILE_REPLACE = '##FILE_REPLACE';

const pipeTemplateSpec = `import { ${CLASS_REPLACE} } from './${FILE_REPLACE}';

describe('${CLASS_REPLACE}', () => {
  it('should create an instance', () => {
    const pipe = new ${CLASS_REPLACE}();
    expect(pipe).toBeTruthy();
  });
});`
