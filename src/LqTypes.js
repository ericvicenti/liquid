/**
 * @flow
 */


export type CreateBookmarkAction = {
  type: 'CREATE_BOOKMARK',
  name: LqName, address: LqAddress, nodeType: any
};

export type BookmarkChooseTypeAction = {
  type: 'BOOKMARK_CHOOSE_TYPE',
  name: LqName, address: LqAddress
};

export type RenameBookmarkAction = {
  type: 'RENAME_BOOKMARK',
  name: LqName, newName: LqName
};

export type DeleteBookmarkAction = {
  type: 'DELETE_BOOKMARK',
  name: LqName
};

export type AddKeyToObjectAction = {
  type: 'ADD_KEY_TO_OBJECT',
  address: LqAddress, name: LqName
};

export type SetBookmarkValueAction = {
  type: 'SET_BOOKMARK_VALUE',
  name: LqName, address?: LqAddress, value: any
};

export type OpenBookmarkAction = {
  type: 'BOOKMARK',
  name: LqName, address?: LqAddress
};

export type AddObjectKeyAction = {
  type: 'ADD_OBJECT_KEY',
  name: LqName, address: LqAddress
};

export type BackAction = {
  type: 'BACK',
};

export type CreateAction = {
  type: 'CREATE',
};

export type LqRoute = {
  action?: LqAction,
  key: string,
  type: string,
};

export type LqAction = (
  CreateBookmarkAction |
  BookmarkChooseTypeAction |
  RenameBookmarkAction |
  DeleteBookmarkAction |
  AddKeyToObjectAction |
  SetBookmarkValueAction |
  OpenBookmarkAction |
  AddObjectKeyAction |
  BackAction |
  CreateAction
);

export type LqAddress = Array<string | number>;

export type LqName = string;

export type LqKey = string;

export type LqRef = {
  __nodeType: 'ref',
  key: string,
  name?: string,
};

export type LqType = LqValue | LqRef;

export type LqTypedObject = {
  __nodeType: LqType,
};

export type LqValue = (
  string |
  number |
  boolean |
  Array<LqValue> |
  LqTypedObject |
  {}
);

export type LqNavigationState = {
  routes: Array<LqRoute>,
  index: number,
};

export type LqStore = {
  navigationState: LqNavigationState,
  objects: {[key: LqKey]: LqValue},
  bookmarks: {[name: string]: LqKey},
};
