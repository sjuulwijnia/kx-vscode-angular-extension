'use strict';
import { AngularSelector } from '../angular-selector';

export function createComponentTemplateSpec(angularSelector: AngularSelector) {
	return componentTemplateSpec
		.replace(new RegExp(CLASS_REPLACE, 'gm'), angularSelector.clazz)
		.replace(new RegExp(FILE_REPLACE, 'gm'), angularSelector.filename);
}

const CLASS_REPLACE = '##CLASS_REPLACE';
const FILE_REPLACE = '##FILE_REPLACE';

const componentTemplateSpec = `import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ${CLASS_REPLACE} } from './${FILE_REPLACE}';

describe('${CLASS_REPLACE}', () => {
	let component: ${CLASS_REPLACE};
	let fixture: ComponentFixture<${CLASS_REPLACE}>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ ${CLASS_REPLACE} ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(${CLASS_REPLACE});
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create an instance', () => {
		expect(component).toBeTruthy();
	});
});`
