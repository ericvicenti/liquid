/*
 * @flow
 */

import type {
  Address,
  CreateBookmarkAction,
  BookmarkChooseTypeAction,
  RenameBookmarkAction,
  DeleteBookmarkAction,
  AddKeyToObjectAction,
  SetBookmarkValueAction,
  OpenBookmarkAction,
  AddObjectKeyAction,
  BackAction,
  CreateAction,
} from './LqTypes';

const LqActions = {};

LqActions.createBookmark = (params: {name: string, address: Address, nodeType: any}): CreateBookmarkAction => ({
  ...params, type: 'CREATE_BOOKMARK',
});

LqActions.bookmarkChooseType = (params: {name: string, address?: Address}): BookmarkChooseTypeAction => ({
  ...params, type: 'BOOKMARK_CHOOSE_TYPE',
});

LqActions.renameBookmark = (params: {name: string, newName: string}): RenameBookmarkAction => ({
  ...params, type: 'RENAME_BOOKMARK',
});

LqActions.deleteBookmark = (params: {name: string}): DeleteBookmarkAction => ({
  ...params, type: 'DELETE_BOOKMARK',
});

LqActions.addKeyToObject = (params: {address: Address, name: string}): AddKeyToObjectAction => ({
  ...params, type: 'ADD_KEY_TO_OBJECT',
});

LqActions.setBookmarkValue = (params: {name: string, address?: Address, value: any}): SetBookmarkValueAction => ({
  ...params, type: 'SET_BOOKMARK_VALUE',
});

LqActions.openBookmark = (params: {name: string, address?: Address}): OpenBookmarkAction => ({
  ...params, type: 'BOOKMARK',
});

LqActions.addObjectKey = (params: {name: string, address: Address}): AddObjectKeyAction => ({
  ...params, type: 'ADD_OBJECT_KEY',
});

LqActions.back = (): BackAction => ({
  type: 'BACK',
});

LqActions.create = (): CreateAction => ({
  type: 'CREATE',
});

module.exports = LqActions;
