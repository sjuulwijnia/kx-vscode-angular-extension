# Angular Context Creator
### kx-vscode-angular-context-creator

A [Visual Studio Code](https://code.visualstudio.com) extension that adds several context-menu options in the explorer view when an [Angular CLI](https://github.com/angular/angular-cli) project is detected.

## Features

Added context-menu options:
* _New Angular Component_: adds a new Angular component to the selected folder using the specified selector.
* _New Angular Directive_: adds a new Angular directive to the selected folder using the specified selector.
* _New Angular Module_: adds a new Angular module to the selected folder using the specified name.
* _New Angular Pipe_: adds a new Angular pipe to the selected folder using the specified name.
* _New Angular Service_: adds a new Angular service to the selected folder using the specified name.

All options use the configuration set in the **.angular-cli.json** file and will attempt to adhere to the found **.editorconfig** as much as possible. It follows the path of the **ng generate ...** commands as much as possible.

During creation, you can choose to use the current configuration or to manually configure the selected option. 

[![https://gyazo.com/9313d7673715a7d577bc3ad1568c9314](https://i.gyazo.com/9313d7673715a7d577bc3ad1568c9314.gif)](https://gyazo.com/9313d7673715a7d577bc3ad1568c9314)

## Requirements

* The workspace only triggers on a **.angular-cli.json** file. If it is not present, it will not activate.
* A **.editorconfig** is optional, but is highly recommended, as kx-vscode-angular-context-creator will try to adhere to the given standards as much as possible.

## Extension Settings
The extension has multiple ways to be configured:
* By editing the **.angular-cli.json** file, you can edit the defaults that will also be used by the **ng generate ...** command.
* By editing the **.vscode/settings.json** file, you can edit the extension defaults that allow for advanced options.
	* Each context-menu option has its own configuration.

## Known Issues

* Sometimes fails to get the correct NgModule file.
* Misses a bunch of **ng generate...** command options.

## Release Notes

* v0.1.0 (14-01-2018): initial release

## Up next

* Add the missing **ng generate...** options.
* Instead of blacklisting characters in the selector input, whitelist the characters that *are* allowed.
* Add some unit tests to guarantee functionality won't break.
* ...maybe a badge/icon?
