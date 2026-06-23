import assert from 'node:assert/strict';
import test from 'node:test';

import {
  beginPrivateNoteEdit,
  cancelPrivateNoteEdit,
  commitPrivateNoteSave,
  createPrivateNoteEditorState,
  updatePrivateNoteDraft,
} from './student-private-note-editor';

test('private note editing starts from the last persisted content', () => {
  const state = beginPrivateNoteEdit(
    createPrivateNoteEditorState('Note enregistrée.')
  );

  assert.equal(state.isEditing, true);
  assert.equal(state.draft, 'Note enregistrée.');
});

test('explicit save is the only transition that replaces persisted content', () => {
  const changed = updatePrivateNoteDraft(
    beginPrivateNoteEdit(createPrivateNoteEditorState('Ancienne note.')),
    'Nouvelle note.'
  );
  const saved = commitPrivateNoteSave(changed, 'Nouvelle note.');

  assert.deepEqual(saved, {
    persistedContent: 'Nouvelle note.',
    draft: 'Nouvelle note.',
    isEditing: false,
  });
});

test('private note draft changes do not mutate persisted content', () => {
  const editing = beginPrivateNoteEdit(
    createPrivateNoteEditorState('Note enregistrée.')
  );
  const changed = updatePrivateNoteDraft(editing, 'Brouillon non sauvegardé.');

  assert.equal(changed.persistedContent, 'Note enregistrée.');
  assert.equal(changed.draft, 'Brouillon non sauvegardé.');
});

test('cancelling restores the persisted content and exits edit mode', () => {
  const editing = updatePrivateNoteDraft(
    beginPrivateNoteEdit(createPrivateNoteEditorState('Note enregistrée.')),
    'Brouillon non sauvegardé.'
  );
  const cancelled = cancelPrivateNoteEdit(editing);

  assert.deepEqual(cancelled, {
    persistedContent: 'Note enregistrée.',
    draft: 'Note enregistrée.',
    isEditing: false,
  });
});
