import { describe, expect, it } from 'vitest';

import { useCreationStringParser } from './CreationStringParser';
import { useLabelStore } from '../stores/labelStore';

describe('CreationStringParser', () => {
  describe('parseCreationString', () => {
    it('should return null if there is no parseable string', async () => {
      const creationStringParser = useCreationStringParser();

      const result = await creationStringParser.parseCreationString('');

      expect(result).toEqual(null);
    });

    describe('title', () => {
      it('should return the title of a new entity', async () => {
        const creationStringParser = useCreationStringParser();

        const result =
          await creationStringParser.parseCreationString('This is a new task');

        expect(result).toEqual({
          title: 'This is a new task',
          labelIds: [],
          newLabels: []
        });
      });

      it('should trim spaces at the start and/or end', async () => {
        const creationStringParser = useCreationStringParser();

        const result = await creationStringParser.parseCreationString(
          ' I have spaces at the beginning and  end.  '
        );

        expect(result).toEqual({
          title: 'I have spaces at the beginning and  end.',
          labelIds: [],
          newLabels: []
        });
      });
    });

    describe('labels', () => {
      it('should not recognize as a label if there is a space between # and text', async () => {
        const creationStringParser = useCreationStringParser();

        const result = await creationStringParser.parseCreationString(
          'This is a task with a # and some more text.'
        );

        expect(result).to.toEqual({
          title: 'This is a task with a # and some more text.',
          labelIds: [],
          newLabels: []
        });
      });

      it('should return non-existing labels as new labels', async () => {
        const creationStringParser = useCreationStringParser();

        const result = await creationStringParser.parseCreationString(
          'This is a new task with new labels #label 1 #new label2'
        );

        expect(result).toEqual({
          title: 'This is a new task with new labels',
          labelIds: [],
          newLabels: ['label 1', 'new label2']
        });
      });

      it('should return existing labels', async () => {
        const labelStore = useLabelStore();

        const label1Id = await labelStore.create({
          name: 'label 1',
          color: '',
          icon: ''
        });

        const label2Id = await labelStore.create({
          name: 'label2',
          color: '',
          icon: ''
        });

        const creationStringParser = useCreationStringParser();

        const result = await creationStringParser.parseCreationString(
          'This is a new task with existing labels #label 1 #label2 '
        );

        expect(result).toEqual({
          title: 'This is a new task with existing labels',
          labelIds: [label1Id, label2Id],
          newLabels: []
        });
      });

      it('should not add label tag without a title', async () => {
        const creationStringParser = useCreationStringParser();

        const result = await creationStringParser.parseCreationString(
          '#label1 #label2 The title is located after the labels :('
        );

        expect(result).toEqual(null);
      });
    });
  });
});
