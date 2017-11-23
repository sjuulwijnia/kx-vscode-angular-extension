'use strict';
import { AngularSelector } from '../angular-selector';

export function createServiceTemplateSpec(angularSelector: AngularSelector) {
	return serviceTemplateSpec
		.replace(new RegExp(CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(SERVICE_REPLACE, 'gm'), angularSelector.filename);
}

const CLASS_REPLACE = '##CLASS_REPLACE';
const SERVICE_REPLACE = '##SERVICE_REPLACE';

const serviceTemplateSpec = `import { TestBed, inject } from '@angular/core/testing';

import { ${CLASS_REPLACE} } from './${SERVICE_REPLACE}';

describe('${CLASS_REPLACE}', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ ${CLASS_REPLACE} ]
		});
	});

	it('should create an instance', inject([${CLASS_REPLACE}], (service: ${CLASS_REPLACE}) => {
		expect(service).toBeTruthy();
	}));
});`
