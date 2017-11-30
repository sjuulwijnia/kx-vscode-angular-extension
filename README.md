# kx-vscode-angular-extension

A Visual Studio Code extension that adds several context-menu options in the sidebar when an [Angular CLI](https://github.com/angular/angular-cli) project is detected.

## Features

Added context-menu options:
* _New Angular Component_: adds a new Angular component to the selected folder using the specified selector.
* _New Angular Directive_: adds a new Angular directive to the selected folder using the specified selector.
* _New Angular Pipe_: adds a new Angular pipe to the selected folder using the specified name.
* _New Angular Service_: adds a new Angular service to the selected folder using the specified name.

All options use the configuration set in the **.angular-cli.json** file and will attempt to adhere to the found **.editorconfig** as much as possible. It follows the path of the **ng generate ...** commands as much as possible.

During creation, you can choose to use the current configuration or to manually configure the selected option. 

[![https://gyazo.com/2f5f4f1150e30a9eb263a48130ef4750](https://i.gyazo.com/2f5f4f1150e30a9eb263a48130ef4750.gif)](https://gyazo.com/2f5f4f1150e30a9eb263a48130ef4750)

## Requirements

* The workspace only triggers on a **.angular-cli.json** file. If it is not present, it will not activate.
* A **.editorconfig** is optional, but is highly recommended, as kx-vscode-angular-extension will try to adhere to the given standards as much as possible.

## Extension Settings
* **kx-vscode-angular-extension.addToNgModule**: When true, the created option will be added to the nearest NgModule it can find.
* **kx-vscode-angular-extension.containerBarrelFile**: When true, it will create a barrel file (index.ts) when a container directory is used. Defaults to true.
* **kx-vscode-angular-extension.containerSuffix**: When true, the container component will also be suffixed (e.g.: 'dashboard-item.component'), when false, it will not be suffixed (e.g.: 'dashboard-item'). Defaults to false.
* **kx-vscode-angular-extension.openCreatedFile**: When true, it will automagically open the created files. Defaults to true.

## Known Issues

..nothing? Or, you know.. missing Module creation, Guard creation.. that kind of stuff!

## Release Notes

None so far!

## Up next

* Generalize replacing CLASS_REPLACE etc. in the templates.
* Add some unit tests to guarantee functionality won't break.
