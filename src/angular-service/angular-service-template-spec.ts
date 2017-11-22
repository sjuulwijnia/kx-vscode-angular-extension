'use strict';
import { AngularSelector } from '../angular-selector';

export function createServiceTemplateSpec(angularSelector: AngularSelector) {
	return serviceTemplateSpec
		.replace(new RegExp(SERVICE_CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(SERVICE_FILE_REPLACE, 'gm'), angularSelector.filename);
}

const SERVICE_CLASS_REPLACE = '##SERVICE_CLASS_REPLACE';
const SERVICE_FILE_REPLACE = '##SERVICE_FILE_REPLACE';

const serviceTemplateSpec = `import { TestBed, inject } from '@angular/core/testing';

import { ${SERVICE_CLASS_REPLACE} } from './${SERVICE_FILE_REPLACE}';

describe('${SERVICE_CLASS_REPLACE}', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ ${SERVICE_CLASS_REPLACE} ]
		});
	});

	it('should be created', inject([${SERVICE_CLASS_REPLACE}], (service: ${SERVICE_CLASS_REPLACE}) => {
		expect(service).toBeTruthy();
	}));
});`
