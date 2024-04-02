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
  BUTTON = 'button',
  BUTTON_GROUP = 'button_group'
}

export type SettingsConfig = {
  name: string;
  settings: Record<string, SettingDefinition>;
};

export type SettingDefinition =
  | InputDefinition
  | SelectDefinition
  | CheckboxDefinition
  | ButtonDefinition
  | ButtonGroupDefinition;

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

type ButtonDefinition = CommonDefinition & {
  type: SettingInputType.BUTTON;
  handler: () => Promise<void>;
};

type ButtonGroupDefinition = CommonDefinition & {
  type: SettingInputType.BUTTON_GROUP;
  buttons: Array<ButtonDefinition>;
};

type CommonDefinition = {
  name: string;
  label: string;
};
