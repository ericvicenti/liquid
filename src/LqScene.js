/**
 * @flow
 */

import Icon, {glyphMap} from 'react-native-vector-icons/Ionicons';
import React, { Component } from 'react';
import {
  ScrollView,
  Keyboard,
  Text,
  Image,
  Switch,
  View,
  TextInput,
} from 'react-native';
import { connect } from 'react-redux';

const stringify = require('json-stable-stringify');

import {
  keyOfObject,
  isTypey,
  extractNativeValue,
  getDefaultValue,
  getNodeType,
  lookupAddress,
  setBookmark,
  dereferenceBookmark,
  dereference,
  presentationStringify,
} from './LqUtils';

import LqErrorScene from './LqErrorScene';
import LqActions from './LqActions';
import LqRow from './LqRow';
import LqStringEditScene from './LqStringEditScene';
import LqNumberEditScene from './LqNumberEditScene';
import LqStyles from './LqStyles';

const LightStyle = {
  text: {color: 'white', fontSize: 15},
  container: {backgroundColor: '#38538E'}
};
const DarkStyle = {
  text: {color: '#38538E', fontSize: 15},
  container: {backgroundColor: 'white', borderWidth: 2, borderColor: '#38538E'}
};
const BooleanEditor = ({value, onSet}) => (
  <ScrollView style={[LqStyles.scrollView, {backgroundColor: 'white'}]}>
    <View style={{margin: 10, flexDirection: 'row', justifyContent: 'center',}}>
      <Switch
        value={extractNativeValue(value) || false}
        onValueChange={e => onSet(e)}
      />
      <Text style={{fontSize: 20, width: 70, margin: 3, marginHorizontal: 10, color: '#4A6A9D'}}>{extractNativeValue(value) ? 'True' : 'False'}</Text>
    </View>
  </ScrollView>
);


const ArrayEditor = connect(
  (store, {value}) => {
    value = extractNativeValue(value) || [];
    return {
      value,
      rows: value.map((item, index) => ({
        item,
        index,
        color: item.color || (item.__nodeType && item.__nodeType.color),
      })),
    };
  },
  (dispatch, {route}) => ({
    addItem: (nextIndex) => dispatch(
      LqActions.bookmarkChooseType({
        name: route.action.name,
        address: route.action.address ?
          [...route.action.address, nextIndex] :
          [nextIndex]
        })
    ),
    openIndex: (keyName) => {
      let {address, name} = route.action;
      address = address || [];
      dispatch(LqActions.openBookmark({name, address: [...address, keyName]}));
    },
  })
)(({rows, value, onSet, openIndex, addItem}) => {
  let things = [];
  if (rows.length) {
    things = rows.map(({item, color, type, index}, i) =>
      <LqRow
        key={'row'+i}
        label={`${i}: ${presentationStringify(item)}`}
        color={color || '#999'}
        onPress={() => openIndex(i)}
      />
    );
  } else {
    things.push(
      <LqRow
        label="Empty Array"
        color="#aaa"
      />
    )
  }
  things.push(
    <LqRow
      label="Add Item"
      onPress={addItem.bind(null, rows.length)}
    />
  )
  return (
    <ScrollView style={[LqStyles.scrollView, {backgroundColor: 'white'}]}>
      {things}
    </ScrollView>
  );
});



const UnionEditor = connect(
  (store, {value}) => {
    return {
    };
  },
  (dispatch, {route}) => ({
  })
)(({value, onSet}) => {
  let things = [];
  return (
    <ScrollView style={[LqStyles.scrollView, {backgroundColor: 'white'}]}>
      {things}
    </ScrollView>
  );
});


function getEditorForNativeType(type) {
  switch (type) {
    case 'boolean':
      return BooleanEditor;
    case 'string':
      return LqStringEditScene;
    case 'array':
      return ArrayEditor;
    case 'object':
      return createObjectEditor({});
    case 'number':
      return LqNumberEditScene;
    default:
      return null;
  }
}

function createObjectEditor(typeObj) {
  return connect(
    (store, {value}) => {
      const rows = Object.keys(value).map(key => ({
        value: value[key],
        key,
      })).filter(r => r.key.indexOf('__') !== 0);
      return { rows };
    },
    (dispatch, {route}) => ({
      addKey: () => dispatch(
        LqActions.addObjectKey({
          name: route.action.name,
          address: route.action.address,
        })
      ),
      openKey: (keyName) => {
        let {address, name} = route.action;
        address = address || [];
        dispatch(LqActions.openBookmark({name, address: [...address, keyName]}));
      },
    })
  )(({rows, onSet, openKey, addKey}) => {
    let things = [];
    if (rows.length) {
      things = rows.map(({value, type, key}) =>
        <LqRow
          label={`${key}: ${stringify(value)}`}
          color={'#999'}
          onPress={() => openKey(key)}
        />
      );
    } else {
      things.push(
        <LqRow
          label="Object Empty"
          color="#aaa"
        />
      )
    }
    things.push(
      <LqRow
        label="New Key"
        onPress={() => addKey()}
      />
    )
    return (
      <ScrollView style={[LqStyles.scrollView, {backgroundColor: 'white'}]}>
        {things}
      </ScrollView>
    );
  });
}

const LqScene = connect(
  (store, {route}) => {
    const {bookmarks, objects} = store;
    const {name, address} = route.action;
    let value = dereferenceBookmark(store, name);
    value = lookupAddress(value, address);
    const nodeType = getNodeType(store, value);
    return { value, nodeType };
  },
  (dispatch, {route}) => ({
    updateValue: (value) => {
      dispatch(LqActions.setBookmarkValue({name: route.action.name, address: route.action.address, value}));
    },
  }),
)(({route, value, nodeType, updateValue}) => {
  
  let Editor = null;

  if (nodeType != null) {
    const {NativeType} = nodeType;
    Editor = getEditorForNativeType(NativeType);
  }

  if (nodeType && !Editor) {
    if (nodeType.__nodeType && nodeType.__nodeType.name === 'Union') {
      Editor = UnionEditor;
    } else {
      Editor = createObjectEditor(nodeType);
    }
  }

  if (Editor) {
    return (
      <Editor
        editable={true}
        value={value}
        route={route}
        onSet={updateValue}
      />
    );
  }

  return <LqErrorScene message={`There is no editor defined for "${nodeType && nodeType.name}" type.`} />;
});

module.exports = LqScene;