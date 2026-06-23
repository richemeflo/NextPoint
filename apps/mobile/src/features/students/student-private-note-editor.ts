export type StudentPrivateNoteEditorState = {
  persistedContent: string | null;
  draft: string;
  isEditing: boolean;
};

export function createPrivateNoteEditorState(
  persistedContent: string | null
): StudentPrivateNoteEditorState {
  return {
    persistedContent,
    draft: persistedContent ?? '',
    isEditing: false,
  };
}

export function beginPrivateNoteEdit(
  state: StudentPrivateNoteEditorState
): StudentPrivateNoteEditorState {
  return {
    ...state,
    draft: state.persistedContent ?? '',
    isEditing: true,
  };
}

export function updatePrivateNoteDraft(
  state: StudentPrivateNoteEditorState,
  draft: string
): StudentPrivateNoteEditorState {
  return { ...state, draft };
}

export function cancelPrivateNoteEdit(
  state: StudentPrivateNoteEditorState
): StudentPrivateNoteEditorState {
  return {
    ...state,
    draft: state.persistedContent ?? '',
    isEditing: false,
  };
}

export function commitPrivateNoteSave(
  state: StudentPrivateNoteEditorState,
  persistedContent: string
): StudentPrivateNoteEditorState {
  return {
    ...state,
    persistedContent,
    draft: persistedContent,
    isEditing: false,
  };
}
