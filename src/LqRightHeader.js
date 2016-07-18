/**
 * @flow
 */

import React from 'react';
import {
  View,
} from 'react-native';
import { connect } from 'react-redux';

import type {LqRoute} from './LqTypes';

import LqStyles from './LqStyles';
import LqHeaderButton from './LqHeaderButton';
import LqActions from './LqActions';
import {
  dereferenceBookmark,
  extractNativeValue,
} from './LqUtils';


const CreateHeaderButton = connect(
  null,
  dispatch => ({
    create: () => dispatch(LqActions.create()),
  }),
)(({create}) => {
  return (
    <LqHeaderButton
      icon="md-add"
      onPress={create}
    />
  );
});

const CreateBookmarkHeaderButton = connect(
  store => ({
    newBookmarkName: extractNativeValue(dereferenceBookmark(store, '__bookmarkNameDraft')),
  }),
  (dispatch, {route}) => ({
    bookmarkChooseType: name => dispatch(LqActions.bookmarkChooseType({name})),
  }),
)(({newBookmarkName, bookmarkChooseType}) => !!newBookmarkName && (
  <LqHeaderButton
    icon="md-checkmark"
    onPress={() => bookmarkChooseType(newBookmarkName)}
  />
));

const CreateKeyHeaderButton = connect(
  null,
  (dispatch, {route}) => ({
    createKey: () => dispatch(LqActions.addKeyToObject({address: route.action.address, name: route.action.name})),
  })
)(({createKey}) => (
  <LqHeaderButton
    icon="md-checkmark"
    onPress={createKey}
  />
));

const RIGHT_BUTTON_FOR_ACTION = {
  HOME: CreateHeaderButton,
  CREATE: CreateBookmarkHeaderButton,
  ADD_OBJECT_KEY: CreateKeyHeaderButton,
};

const LqRightHeader = ({route}: {route: LqRoute}) => {
  const Buttons = RIGHT_BUTTON_FOR_ACTION[route.type];
  if (Buttons) {
    return (
      <View style={LqStyles.headerButtons}>
        <Buttons route={route} />
      </View>
    );
  }
  return null;
};

module.exports = LqRightHeader;
