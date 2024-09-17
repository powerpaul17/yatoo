import { useLabelStore } from '../stores/labelStore';

export const useCreationStringParser = (): CreationStringParser => {
  return new CreationStringParser();
};

class CreationStringParser {
  private state = State.TITLE;

  public async parseCreationString(
    creationString: string
  ): Promise<TodoCreationData | null> {
    this.state = State.TITLE;

    const parts = creationString.split(' ');
    if (!parts.length) return null;

    const titleParts = [];

    const labelNames: Array<string> = [];

    const currentLabelNameParts = [];

    for (const part of parts) {
      if (part.startsWith('#')) {
        if (!titleParts.length) return null;

        if (currentLabelNameParts.length) {
          labelNames.push(currentLabelNameParts.join(' '));
          currentLabelNameParts.length = 0;
        }

        this.state = State.TAG;
        currentLabelNameParts.push(part.slice(1));
      } else {
        if (this.state === State.TITLE) {
          titleParts.push(part);
        } else if (this.state === State.TAG) {
          currentLabelNameParts.push(part);
        }
      }
    }

    if (currentLabelNameParts.length) {
      labelNames.push(currentLabelNameParts.join(' '));
    }

    const labelStore = useLabelStore();
    const labelIds = [];
    const newLabels = [];

    for (const labelName of labelNames) {
      const label = await labelStore.getByName(labelName);
      if (label) {
        labelIds.push(label.id);
      } else {
        newLabels.push(labelName);
      }
    }

    return {
      title: titleParts.join(' ').trim(),
      labelIds,
      newLabels
    };
  }
}

export type TodoCreationData = {
  title: string;
  labelIds: Array<string>;
  newLabels: Array<string>;
};

enum State {
  TITLE = 'title',
  TAG = 'tag'
}
