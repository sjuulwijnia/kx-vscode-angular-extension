'use strict';
import { AngularSelector } from '../angular-selector';

export function createComponentTemplateSpec(angularSelector: AngularSelector) {
	return componentTemplateSpec
		.replace(new RegExp(COMPONENT_CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(COMPONENT_FILE_REPLACE, 'gm'), angularSelector.filename);
}

const COMPONENT_CLASS_REPLACE = 'SERVICE_CLASS_REPLACE';
const COMPONENT_FILE_REPLACE = '##COMPONENT_FILE_REPLACE';

const componentTemplateSpec = `import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ${COMPONENT_CLASS_REPLACE} } from './${COMPONENT_FILE_REPLACE}';

describe('${COMPONENT_CLASS_REPLACE}', () => {
	let component: ${COMPONENT_CLASS_REPLACE};
	let fixture: ComponentFixture<${COMPONENT_CLASS_REPLACE}>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ ${COMPONENT_CLASS_REPLACE} ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(${COMPONENT_CLASS_REPLACE});
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});`
