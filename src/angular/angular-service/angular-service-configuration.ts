import {
	AngularCliServiceConfiguration,
	ExtensionServiceConfiguration
} from '../../config-watchers';

export interface ServiceConfiguration extends AngularCliServiceConfiguration, ExtensionServiceConfiguration { }
