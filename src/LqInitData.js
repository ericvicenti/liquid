/*
 * @flow
 */

import {
  keyOfObject,
} from './LqUtils';
import {glyphMap} from 'react-native-vector-icons/Ionicons';

import type {
  LqValue,
} from './LqTypes';

const LqInitData = {
  objects: {},
  bookmarks: {},
};

function _make(name: string, value: LqValue) {
  const key = keyOfObject(value);
  LqInitData.objects[key] = value;
  LqInitData.bookmarks[name] = key;
  return {
    __nodeType: 'ref',
    name,
    key,
  };
}

const LqString = _make('primitive_string', {
  ClassName: 'Text',
  NativeType: 'string',
  NativeTypeDefaultValue: '',
  Color: '#9C664A',
  Icon: 'md-quote',
});

const LqNumber = _make('primitive_number', {
  ClassName: 'Number',
  NativeType: 'number',
  NativeTypeDefaultValue: 0,
  Color: '#70A04A',
  Icon: 'ios-timer',
});

const LqToggle = _make('primitive_boolean', {
  ClassName: 'Toggle',
  NativeType: 'boolean',
  NativeTypeDefaultValue: false,
  Color: '#4A6A9D',
  Icon: 'ios-checkmark-circle',
});

const LqObject = _make('primitive_object', {
  ClassName: 'Object',
  NativeType: 'object',
  NativeTypeDefaultValue: {},
  Color: '#9D7A4A',
  Icon: 'ios-book-outline',
});

const LqList = _make('primitive_array', {
  ClassName: 'List',
  NativeType: 'array',
  NativeTypeDefaultValue: [],
  Color: '#9C457E',
  Icon: 'ios-list-outline',
});

// const LqSwitch = _make('Switch', {
//   Condition: LqToggle,
//   Icon: 'ios-checkmark-circle',
//   ClassName: 'Switch',
//   Color: 'purple',
//   IfTrue: null,
//   IfFalse: null,
// });

const LqUnion = _make('Union', {
  Types: LqList,
});

const LqIcon = _make('Icon', {
  __nodeType: LqUnion,
  ClassName: 'Icon',
  Types: Object.keys(glyphMap).filter(g => g.indexOf('ios') === 0),
});

const LqViewStyle = _make('ViewStyle', {
  BackgroundColor: LqString,
});

const LqView = _make('View', {
  Style: { __nodeType: LqViewStyle },
});

const LqText = _make('Text', {
});


// TEST BASIC TYPES
_make('AToggle', false);
_make('ANumber', 47);
_make('AString', 'B String');
_make('AObject', {fun: true, number: 47});
_make('AList', ['foo', 'bar', 47, true]);

// _make('AUnionExample', {
//   __nodeType: LqIcon,
// });

// _make('Row', {
//   Icon: LqString,
//   Label: LqString,
//   Color: LqString,
// });

// Task: {
//   ClassName: 'Task',
//   Color: '#9C457E',
//   Icon: 'ios-checkmark-circle',
//   Name: LqString,
//   IsDone: LqToggle,
//   Title: 'foo',
//   Presentation: [
//     {
//       // __nodeType: LqView,
//       Style: {
//         backgroundColor: {
//           // __nodeType: LqSwitch,
//           // Condition: {__nodeType: Match, comparisonRef: {ref to "A"} refName: 'Name'},
//           // Condition: {__nodeType: Match, comparisonRef: true, refName: IsDone},
//           // Condition: true,
//           // Condition: IsDone,
//           IfTrue: 'blue',
//           IfFalse: 'red',
//         },
//       },
//       Children: [
//         // {__nodeType: {ref to Text}, value: 'Foo'}
//       ],
//     },
//   ],
// },

module.exports = LqInitData;
