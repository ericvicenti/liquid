/*
 * @flow
 */

import {
  NavigationExperimental,
} from 'react-native';
import {
  keyOfObject,
  setBookmark,
  deleteBookmark,
  getDefaultValue,
  extractNativeValue,
  dereferenceBookmark,
} from './LqUtils';
import LqInitData from './LqInitData';
import LqActions from './LqActions';
const {CardStack, Header, StateUtils} = NavigationExperimental;

import type {
  LqAction,
  LqRoute,
  LqNavigationState,
  LqStore,
} from './LqTypes';

const PUSH_ACTIONS = [
  'BOOKMARK_CHOOSE_TYPE',
  'ADD_OBJECT_KEY',
  'CREATE',
  'BOOKMARK',
];

function makeRoute(action): LqRoute {
  return {
    key: `${action.type}-${Date.now()}`,
    action: action,
    type: action.type,
  };
}

const HOME_ROUTE = {
  key: 'Welcome', type: 'HOME'
};

function NavState(state: LqNavigationState = {
  index: 0,
  routes: [HOME_ROUTE],
}, action: LqAction) {
  const {type} = action;
  if (PUSH_ACTIONS.indexOf(type) !== -1) {
    return StateUtils.push(state, makeRoute(action));
  }
  switch (action.type) {
    case 'BACK':
      return StateUtils.pop(state);
    case 'CREATE_BOOKMARK': {
      const {name} = action;
      return {
        ...state,
        index: 1,
        routes: [
          HOME_ROUTE,
          makeRoute(LqActions.openBookmark({name})),
        ],
      };
    }
    default:
      return state;
  }
}

const LqStoreReducer = (state: ?LqStore, action: LqAction): LqStore => {

  state = state || {};
  state = {
    navigationState: NavState(state.navigationState, action),
    objects: state.objects || LqInitData.objects,
    bookmarks: state.bookmarks || LqInitData.bookmarks,
  };
  const {bookmarks, objects, navigationState} = state;
  switch (action.type) {
    case 'DELETE_BOOKMARK': {
      const {name} = action;
      return deleteBookmark(state, name);
    }
    // case 'BOOKMARK_CHOOSE_TYPE':
    //   return deleteBookmark(state, '__bookmarkNameDraft');
    case 'CREATE_BOOKMARK': {
      const {name, address, nodeType} = action;
      const initValue = getDefaultValue(state, nodeType);
      return setBookmark(state, name, address, initValue);
    }
    case 'RENAME_BOOKMARK': {
      const {name, newName} = action;
      const key = bookmarks[name];
      return {
        ...state,
        bookmarks: {
          ...bookmarks,
          [name]: null,
          [newName]: key,
        },
      };
    }
    case 'ADD_KEY_TO_OBJECT': {
      let {address, name} = action;
      let {navigationState} = state;
      const newKeyName = extractNativeValue(dereferenceBookmark(state, '__keyNameDraft'));
      address = address ? [...address, newKeyName] : [newKeyName];
      navigationState = StateUtils.pop(navigationState);
      navigationState = StateUtils.push(navigationState, makeRoute(LqActions.bookmarkChooseType({name, address})));
      return {
        ...deleteBookmark(state, '__keyNameDraft'),
        navigationState,
      };
    }
    case 'SET_BOOKMARK_VALUE': {
      const {name, address, value} = action;
      return setBookmark(state, name, address, value);
    }
    default:
      return state;
  }
}

module.exports = LqStoreReducer;

