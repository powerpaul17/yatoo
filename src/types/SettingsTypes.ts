export enum SettingInputType {
  STRING = 'string',
  URL = 'url',
  PASSWORD = 'password',
  TIME = 'time',
  INTEGER = 'integer',
  FLOAT = 'float',
  CHECKBOX = 'checkbox',
  DROPDOWN = 'dropdown',
  RADIOBUTTON = 'radiobutton',
  FILE = 'file',
  BUTTON = 'button',
  INPUT_GROUP = 'input_group'
}

export type SettingsConfig = {
  name: string;
  labelTk: string;
  settings: Record<string, SettingDefinition>;
};

export type SettingDefinition =
  | InputDefinition
  | SelectDefinition
  | CheckboxDefinition
  | FileDefinition
  | ButtonDefinition
  | InputGroupDefinition;

type InputDefinition = CommonDefinition & {
  type:
    | SettingInputType.STRING
    | SettingInputType.URL
    | SettingInputType.PASSWORD
    | SettingInputType.TIME
    | SettingInputType.INTEGER
    | SettingInputType.FLOAT;
};

type SelectDefinition = CommonDefinition & {
  type: SettingInputType.DROPDOWN | SettingInputType.RADIOBUTTON;
  choices: Array<string> | (() => Array<string> | Promise<Array<string>>);
};

type CheckboxDefinition = CommonDefinition & {
  type: SettingInputType.CHECKBOX;
};

type FileDefinition = CommonDefinition & {
  type: SettingInputType.FILE;
  accept?: string;
  handler: (file: File) => Promise<void>;
};

type ButtonDefinition = CommonDefinition & {
  type: SettingInputType.BUTTON;
  handler: () => Promise<void>;
};

type InputGroupDefinition = CommonDefinition & {
  type: SettingInputType.INPUT_GROUP;
  children: Array<SettingDefinition>;
};

type CommonDefinition = {
  name: string;
  labelTk?: string;
};
