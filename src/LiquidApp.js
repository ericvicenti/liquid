/**
 * @flow
 */

import Icon, {glyphMap} from 'react-native-vector-icons/Ionicons';
import React, { Component } from 'react';
import {
  AppState,
  AsyncStorage,
  Alert,
  AlertIOS,
  ScrollView,
  StyleSheet,
  Keyboard,
  NavigationExperimental,
  Text,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  Switch,
  View,
  Clipboard,
  TextInput,
} from 'react-native';
import codePush from "react-native-code-push";
const dismissKeyboard = require('dismissKeyboard');
import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
AsyncStorage.clear();

// Clipboard.getString().then(t => console.log('CC', t));

const stringify = require('json-stable-stringify');
const {CardStack, Header, StateUtils} = NavigationExperimental;

import {persistStore, autoRehydrate} from 'redux-persist'

import {
  keyOfObject,
  isTypey,
  setBookmark,
  getDefaultValue,
  extractNativeValue,
  dereferenceBookmark,
  dereference,
} from './LiquidUtils';

function presentationStringify(a) {
  return stringify(a);
}

// function debugize(name, fn) {
//   return function() {
//     // console.log('CALLING ', name, arguments);
//     const output = fn.apply(this, arguments);
//     console.log(name, arguments, output);
//     return output;
//   }
// }

// const RemountHOC = (name, C) => {
//   return class RemountContainer extends React.Component {
//     constructor() {
//       super();
//       console.log('FRESH INSTANCE OF ', name);
//     }
//     render() {
//       return <C {...this.props} />;
//     }
//   }
// }

// class LiquidAppIconPicker extends Component {
//   render() {
//     return (
//       <ScrollView style={LiquidStyles2.container}>
//         <Text style={LiquidStyles2.welcome}>
//           Choose an icon:
//         </Text>
//         <Text style={{padding: 10}}>
//           {Object.keys(glyphMap).map(iconName => <Text onPress={() => Alert.alert(iconName)}>
//             {' '}<Icon name={iconName} size={48} color="#4F8EF7" />{' '}
//           </Text>)}
//         </Text>
//       </ScrollView>
//     );
//   }
// }

// const LiquidStyles2 = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5FCFF',
//   },
//   welcome: {
//     fontSize: 20,
//     textAlign: 'center',
//     margin: 10,
//   },
// });

const PUSH_ACTIONS = [
  'BOOKMARK_CHOOSE_TYPE',
  'ADD_OBJECT_KEY',
  'CREATE',
  'BOOKMARK',
];

function makeRoute(action) {
  return {
    key: `${action.type}-${Date.now()}`,
    action: action,
    type: action.type,
  };
}

function NavState(state = {
  index: 0,
  routes: [{key: 'Welcome', type: 'HOME'}],
}, action) {
  const {type} = action;
  if (PUSH_ACTIONS.indexOf(type) !== -1) {
    return StateUtils.push(state, makeRoute(action));
  }
  switch (type) {
    case 'BACK':
    case 'ADD_KEY_TO_OBJECT':
      return StateUtils.pop(state);
    case 'CREATE_BOOKMARK':
      const {name} = action;
      return {
        ...state,
        index: 1,
        routes: [
          state.routes[0],
          makeRoute(Actions.openBookmark({name})),
        ],
      };
    default:
      return state;
  }
}

const BUILT_IN_TYPES = {
  primitive_string: {
    ClassName: 'Text',
    NativeType: 'string',
    NativeTypeDefaultValue: '',
    Color: '#9C664A',
    Icon: 'md-quote',
  },
  primitive_number: {
    ClassName: 'Number',
    NativeType: 'number',
    NativeTypeDefaultValue: 0,
    Color: '#70A04A',
    Icon: 'ios-timer',
  },
  primitive_boolean: {
    ClassName: 'Toggle',
    NativeType: 'boolean',
    NativeTypeDefaultValue: false,
    Color: '#4A6A9D',
    Icon: 'ios-checkmark-circle',
  },
  primitive_object: {
    ClassName: 'Object',
    NativeType: 'object',
    NativeTypeDefaultValue: {},
    Color: '#9D7A4A',
    Icon: 'ios-book-outline',
  },
  primitive_array: {
    ClassName: 'List',
    NativeType: 'array',
    NativeTypeDefaultValue: [],
    Color: '#9C457E',
    Icon: 'ios-list-outline',
  },
};

function createPrimitiveTypeRef(primitiveName) {
  const name = `primitive_${primitiveName}`;
  const type = BUILT_IN_TYPES[name];
  return {
    __nodeType: 'ref',
    name,
    key: keyOfObject(BUILT_IN_TYPES[type]),
  };
}

const BUILT_IN_BOOKMARKS = {
  ...BUILT_IN_TYPES,

  // types: Object.keys(BUILT_IN_TYPES).map(type => ({
  //   __nodeType: 'ref',
  //   name: type,
  //   key: keyOfObject(BUILT_IN_TYPES[type]),
  // })),

  A: 'A Team',
  B: 'B String',

  // Union: {
  //   ClassName: 'Union Type',    
  // },

  Task: {
    ClassName: 'Task',
    Color: '#9C457E',
    Icon: 'ios-checkmark-circle',
    Name: createPrimitiveTypeRef('string'),
    IsDone: createPrimitiveTypeRef('boolean'),
  },

  // primitive_type: {
  //   type: 'type',
  //   color: '#453559',
  //   icon: 'ios-funnel',
  // }

  // // TEST BASIC TYPES
  // foo: 'bar',
  // baz: false,
  // such: {
  //   fun: true,
  // },
};
const DEFAULT_BOOKMARKS = {};
const DEFAULT_OBJECTS = {};

Object.keys(BUILT_IN_BOOKMARKS).map(bookmarkName => {
  const value = BUILT_IN_BOOKMARKS[bookmarkName];
  const key = keyOfObject(value);
  DEFAULT_OBJECTS[key] = value;
  DEFAULT_BOOKMARKS[bookmarkName] = key;
});

const LiquidAppReducer = (state, action) => {
  state = state || {};
  const newState = {
    navigationState: NavState(state.navigationState, action),
    objects: state.objects || DEFAULT_OBJECTS,
    bookmarks: state.bookmarks || DEFAULT_BOOKMARKS,
  };
  const {bookmarks, objects, navigationState} = newState;
  switch (action.type) {
    case 'DELETE_BOOKMARK': {
      const {name} = action;
      return {
        ...newState,
        bookmarks: {
          ...bookmarks,
          [name]: null,
        },
      };
    }
    case 'BOOKMARK_CHOOSE_TYPE':
      return {
        ...newState,
        bookmarks: {
          ...bookmarks,
          __bookmarkNameDraft: null, 
        },
      };
    case 'CREATE_BOOKMARK': {
      const {name, address, nodeType} = action;
      const initValue = getDefaultValue(newState, nodeType);
      return setBookmark(newState, name, address, initValue);
    }
    case 'RENAME_BOOKMARK': {
      const {name, newName} = action;
      const key = bookmarks[name];
      return {
        ...newState,
        bookmarks: {
          ...bookmarks,
          [name]: null,
          [newName]: key,
        },
      };
    }
    case 'ADD_KEY_TO_OBJECT': {
      const {name} = action;
      const newKeyName = objects[bookmarks.__keyNameDraft];
      const oldObject = objects[bookmarks[name]];
      const newObject = {
        ...oldObject,
        [newKeyName]: null,
      };
      const stringValue = stringify(newObject);
      const key = keyOfObject(stringValue);
      return {
        ...newState,
        bookmarks: {
          ...bookmarks,
          __keyNameDraft: null,
          [name]: key,
        },
        objects: {
          ...objects,
          [key]: newObject,
        },
      };      
    }
    case 'SET_BOOKMARK_VALUE': {
      const {name, address, value} = action;
      return setBookmark(newState, name, address, value);
    }
    default:
      return newState;
  }
}

const Actions = {
  createBookmark({name, address, nodeType}) {
    return {type: 'CREATE_BOOKMARK', name, address, nodeType};
  },
  bookmarkChooseType({name, address}) {
    return {type: 'BOOKMARK_CHOOSE_TYPE', name, address};
  },
  renameBookmark({name, newName}) {
    return {type: 'RENAME_BOOKMARK', name, newName};
  },
  deleteBookmark({name}) {
    return {type: 'DELETE_BOOKMARK', name};
  },
  addKeyToObject({address, name}) {
    return {type: 'ADD_KEY_TO_OBJECT', address, name};
  },
  setBookmarkValue({name, address, value}) {
    return {type: 'SET_BOOKMARK_VALUE', name, address, value};
  },
  openBookmark({name, address}) {
    return {type: 'BOOKMARK', address, name};
  },
  addObjectKey({name, address}) {
    return {type: 'ADD_OBJECT_KEY', address, name};
  },
  back() {
    return {type: 'BACK'};
  },
  create() {
    return {type: 'CREATE'};
  },
};

class ListSceneWithFilter extends React.Component {
  state = {filter: ''};
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ScrollView style={LiquidStyles.scrollView} keyboardDismissMode="interactive">
        <View style={{backgroundColor: 'white', height: 40, margin: 5, borderRadius: 20, flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, borderColor: '#999' }}>
          <TextInput
            value={this.state.filter}
            style={{flex: 1, paddingLeft: 47, marginRight: 5}}
            placeholder="Search Types"
            clearButtonMode="while-editing"
            placeholderTextColor="#777"
            onChange={(e) => {
              this.setState({filter: e.nativeEvent.text});
            }}
          />
          <Icon
            name="ios-search"
            color="#777"
            size={24}
            style={{position: 'absolute', left: 15, top: 7}}
          />
        </View>
        <View style={{borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd'}} />
        {this.props.rows.filter(row => (row.searchString.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1)).map(row => row.view)}
      </ScrollView>
    );
  }
}

const AwesomeRow = ({color, icon, onPress, onLongPress, label}) => (
  <TouchableHighlight
    style={{borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd'}}
    onPress={onPress}
    onLongPress={onLongPress}>
    <View style={{flexDirection: 'row', backgroundColor: 'white'}}>
      {icon && <Icon
        size={24}
        color={color || '#777'}
        style={{width: 24, height: 24, margin: 15, marginRight: 0}}
        name={icon}
      />}
      <Text style={{color: color || '#777', paddingVertical: 18, paddingLeft: 15, paddingRight: 35, flex: 1}}>
        {label}
      </Text>
      {onPress && <Icon
        color="#666"
        size={24}
        style={{right: 16, position: 'absolute', margin: 16, alignSelf: 'flex-end'}}
        name="ios-arrow-forward"
      />}
    </View>
  </TouchableHighlight>
);

const ChooseTypeScene = connect(
  store => ({
    types: Object.keys(store.bookmarks).sort().map(name => {
      // const thing = store.objects[store.bookmarks[name]];
      return dereferenceBookmark(store, name);
    }),
  }),
  dispatch => ({
    setType: (name, address, nodeType) => dispatch(Actions.createBookmark({name, address, nodeType})),
  })
)(({setType, types, route}) => {
  return (
    <ListSceneWithFilter
      rows={types.filter(isTypey).map((type, i) => ({
        view:
          <AwesomeRow
            key={type.__ref.name}
            onPress={() => setType(route.action.name, route.action.address, type.__ref)}
            label={`New ${type.ClassName}`}
            icon={type.Icon}
            color={type.Color}
          />,
        searchString: type.name+' '+type.__ref.name,
      }))}
    />
  );
});

const LightStyle = {
  text: {color: 'white', fontSize: 15},
  container: {backgroundColor: '#38538E'}
};
const DarkStyle = {
  text: {color: '#38538E', fontSize: 15},
  container: {backgroundColor: 'white', borderWidth: 2, borderColor: '#38538E'}
};
const BooleanEditor = ({value, onSet}) => (
  <ScrollView style={[LiquidStyles.scrollView, {backgroundColor: 'white'}]}>
    <View style={{margin: 10, flexDirection: 'row', justifyContent: 'center',}}>
      <Switch
        value={extractNativeValue(value)}
        onValueChange={e => onSet(e)}
      />
      <Text style={{fontSize: 20, width: 70, margin: 3, marginHorizontal: 10, color: '#4A6A9D'}}>{extractNativeValue(value) ? 'True' : 'False'}</Text>
    </View>
  </ScrollView>
);

const THIS_IS_CRAP = {
  color: '#999',
  icon: null,
};

function createObjectEditor(typeObj) {
  return connect(
    (store, {value}) => {
      const rows = Object.keys(value).map(key => ({
        type: THIS_IS_CRAP,
        value: value[key],
        key,
      })).filter(r => r.key.indexOf('__') !== 0);
      return { rows };
    },
    (dispatch, {route}) => ({
      addKey: () => dispatch(Actions.addObjectKey({name: route.action.name, address: route.action.address})),
      openKey: (keyName) => {
        let {address, name} = route.action;
        address = address || [];
        dispatch(Actions.openBookmark({name, address: [...address, keyName]}));
      },
    })
  )(({rows, onSet, openKey, addKey}) => {
    let things = [];
    if (rows.length) {
      things = rows.map(({value, type, key}) =>
        <AwesomeRow
          label={`${key}: ${presentationStringify(value)}`}
          color={type.color}
          icon={type.icon}
          onPress={() => openKey(key)}
        />
      );
    } else {
      things.push(
        <AwesomeRow
          label="Object Empty"
          color="#aaa"
        />
      )
    }
    things.push(
      <AwesomeRow
        label="New Key"
        onPress={() => addKey()}
      />
    )
    return (
      <ScrollView style={[LiquidStyles.scrollView, {backgroundColor: 'white'}]}>
        {things}
      </ScrollView>
    );
  });
}

const ArrayEditor = connect(
  (store, {value}) => {
    value = extractNativeValue(value) || [];
    return {
      value,
      rows: value.map((item, index) => ({
        type: THIS_IS_CRAP,
        value: value[index],
        index,
      })),
    };
  },
  (dispatch, {route}) => ({
    openKey: (keyName) => {
      let {address, name} = route.action;
      address = address || [];
      dispatch(Actions.openBookmark({name, address: [...address, keyName]}));
    },
  })
)(({rows, value, onSet, openKey, addKey}) => {
  let things = [];
  if (rows.length) {
    things = rows.map(({value, type, index}, i) =>
      <AwesomeRow
        key={'row'+i}
        label={`${i}: ${presentationStringify(value)}`}
        color={type.color}
        icon={type.icon}
        onPress={() => openKey(i)}
      />
    );
  } else {
    things.push(
      <AwesomeRow
        label="Empty Array"
        color="#aaa"
      />
    )
  }
  things.push(
    <AwesomeRow
      label="Add Item"
      onPress={() => {
        const newA = [...value, null];
        onSet(newA);
      }}
    />
  )
  return (
    <ScrollView style={[LiquidStyles.scrollView, {backgroundColor: 'white'}]}>
      {things}
    </ScrollView>
  );
});

class EditorWithKeyboard extends React.Component {
  _input: TextInput;
  state = {
    keyboardHeight: 0,
  };
  _subscriptions: Array<any>;
  componentDidMount() {
    setTimeout(() => {
      this._input && this._input.focus();
    }, 300);
    this._subscriptions = [
      Keyboard.addListener('keyboardWillChangeFrame', this.onKeyboardChange.bind(null, 'change')),
      Keyboard.addListener('keyboardWillHide', this.onKeyboardChange.bind(null, 'hide')),
      Keyboard.addListener('keyboardWillShow', this.onKeyboardChange.bind(null, 'show')),
    ];
  }
  componentWillUnmount() {
    this._subscriptions.forEach((subscription) => subscription.remove());
    this._subscriptions = [];
  }
  onKeyboardChange = (eventType, e) => {
    let keyboardHeight = e.endCoordinates.height;
    if (eventType === 'hide') {
      keyboardHeight = 0;
    }
    this.setState({
      keyboardHeight,
    });
  };
  render = () => (
    <ScrollView style={{flex: 1, backgroundColor: 'white', paddingRight: 1, }} keyboardDismissMode="interactive" contentContainerStyle={{flex:1}}>
      <TextInput
        placeholder={this.props.placeholder}
        ref={input => {this._input = input;}}
        multiline
        editable={this.props.editable}
        keyboardType={this.props.keyboardType}
        style={{flex:1, marginLeft: 10, marginBottom: this.state.keyboardHeight, paddingVertical: 10}}
        onChange={(e) => {
          this.props.onChange(e.nativeEvent.text);
        }}>
          <Text style={{fontSize: 18, color: this.props.color, paddingLeft: 10}}>{extractNativeValue(this.props.value)}</Text>
      </TextInput>
    </ScrollView>
  );
}

let StringEditor = (props) => (
  <EditorWithKeyboard
    color="#9C664A"
    placeholder={props.placeholder || "Empty text"}
    onChange={props.onSet}
    editable={props.editable}
    value={extractNativeValue(props.value)}
  />
);

const NumberEditor = (props) => (
  <EditorWithKeyboard
    color="#70A04A"
    placeholder="Empty number"
    keyboardType="numeric"
    editable={props.editable}
    onChange={(t) => {
      const val = Number(t);
      if (Number.isNaN(val)) {
        return;
      }
      props.onSet(val);
    }}
    value={extractNativeValue(props.value)}
  />
);

function getEditorForNativeType(type) {
  switch (type) {
    case 'boolean':
      return BooleanEditor;
    case 'string':
      return StringEditor;
    case 'array':
      return ArrayEditor;
    case 'object':
      return createObjectEditor({});
    case 'number':
      return NumberEditor;
    default:
      return null;
  }
}

const ErrorScene = ({message}) => (
  <View style={{flex: 1, alignItems: 'center', flexDirection: 'row', padding: 20}}>
    <Text style={{textAlign: 'center', flex: 1, color: '#888', fontSize: 24}}>{message}</Text>
  </View>
);


function getNodeType(store, value) {
  if (value == null) {
    return null;
  }
  if (typeof value !== 'object') {
    return dereferenceBookmark(store, `primitive_${typeof value}`);
  }
  if (value instanceof Array) {
    return dereferenceBookmark(store, 'primitive_array');
  }
  if (value.__nodeType && value.__nodeType.__nodeType === 'ref') {
    return dereference(store, value.__nodeType);
  }
  if (value.__nodeType) {
    return value.__nodeType;
  }
  return dereferenceBookmark(store, 'primitive_object');
}

let BookmarkScene = connect(
  (store, {route}) => {
    const {bookmarks, objects} = store;
    let value = objects[bookmarks[route.action.name]];
    if (route.action.address) {
      route.action.address.forEach(a => {
        if (!value) {
          debugger;
        }
        value = value[a];
      });
    }
    const nodeType = getNodeType(store, value);
    return { value, nodeType };
  },
  (dispatch, {route}) => ({
    updateValue: (value) => {
      dispatch(Actions.setBookmarkValue({name: route.action.name, address: route.action.address, value}));
    },
  }),
)(({route, value, nodeType, updateValue}) => {
  
  let Editor = null;

  if (nodeType != null) {
    const {NativeType} = nodeType;
    Editor = getEditorForNativeType(NativeType);
  }

  if (!Editor) {
    Editor = createObjectEditor(nodeType);
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

  return <ErrorScene message={`There is no editor defined for "${nodeType.name}" type.`} />;
});

const AddObjectKeyScene = connect(
  ({bookmarks, objects}, {route}) => ({
    keyName: objects[bookmarks.__keyNameDraft],
  }),
  dispatch => ({
    setKeyName: name => dispatch(Actions.setBookmarkValue({name: '__keyNameDraft', value: name})),
  }),
)(({setKeyName, keyName}) => {
  return (
    <StringEditor
      value={keyName}
      placeholder="New Key on Object"
      onSet={setKeyName}
    />
  );
});

const CreateBookmarkScene = connect(
  (store, {route}) => ({
    bookmarkName: dereferenceBookmark(store, '__bookmarkNameDraft'),
  }),
  dispatch => ({
    setDraftName: name => dispatch(Actions.setBookmarkValue({name: '__bookmarkNameDraft', value: name})),
  }),
)(({bookmarkName, setDraftName}) => {
  return (
    <StringEditor
      value={bookmarkName}
      placeholder="New Bookmark Name"
      onSet={setDraftName}
    />
  );
});

const BookmarksScene = connect(
  store => ({
    rows: Object.keys(store.bookmarks).sort().map(name => {
      if (!store.bookmarks[name]) {
        return false;
      }
      const value = store.objects[store.bookmarks[name]];
      const nodeType = getNodeType(store, value);
      let icon = (value && value.Icon) || (nodeType && nodeType.Icon);
      let color = (value && value.Color) || (nodeType && nodeType.Color) || '#333';
      return {name, value, nodeType, icon, color};
    }).filter(r => !!r),
  }),
  dispatch => ({
    chooseType: name => dispatch(Actions.bookmarkChooseType({name})),
    deleteBookmark: name => dispatch(Actions.deleteBookmark({name})),
    openBookmark: name => dispatch(Actions.openBookmark({name})),
    renameBookmark: (name, newName) => dispatch(Actions.renameBookmark({name, newName})),
  })
)(({rows, chooseType, openBookmark, deleteBookmark, renameBookmark}) => (
  <ListSceneWithFilter
    rows={rows.filter(r => r.name.indexOf('__') !== 0).map(({name, value, color, icon}) => ({
      view: (
        <AwesomeRow
          key={name}
          label={`${name} : ${presentationStringify(value)}`}
          color={color || '#333'}
          icon={icon}
          onPress={() => openBookmark(name)}
          onLongPress={() => {
            Alert.alert(
              `Edit "${name}" Bookmark`,
              null,
              [
                {text: 'Delete', onPress: deleteBookmark.bind(null, name), style: 'destructive' },
                {text: 'Cancel', style: 'cancel' },
                {text: 'Rename', onPress: () => {
                  AlertIOS.prompt(
                    `Rename ${name}`,
                    null,
                    newName => renameBookmark(name, newName),
                  );
                } },
                {text: 'Reset Type', onPress: () => {
                  chooseType(name);
                }}
              ]
            );
          }}
        />
      ),
      searchString: name,
    }))}
  />
));

const COMPONENT_FOR_ACTION = {
  HOME: BookmarksScene,
  CREATE: CreateBookmarkScene,
  BOOKMARK: BookmarkScene,
  ADD_OBJECT_KEY: AddObjectKeyScene,
  BOOKMARK_CHOOSE_TYPE: ChooseTypeScene,
};

const HeaderButton = ({onPress, icon}) => {
  return (
    <TouchableOpacity
      style={LiquidStyles.headerButton}
      onPress={onPress}>
      <Icon
        name={icon}
        size={24}
        color="#444"
        style={LiquidStyles.headerButtonIcon}
      />
    </TouchableOpacity>
  );
}

const CreateHeaderButton = connect(
  null,
  dispatch => ({
    create: () => dispatch(Actions.create()),
  }),
)(({create}) => {
  return (
    <HeaderButton
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
    bookmarkChooseType: name => dispatch(Actions.bookmarkChooseType({name})),
  }),
)(({newBookmarkName, bookmarkChooseType}) => !!newBookmarkName && (
  <HeaderButton
    icon="md-checkmark"
    onPress={() => bookmarkChooseType(newBookmarkName)}
  />
));

const LiquidRightHeader = ({route}) => (
  <View style={LiquidStyles.headerButtons}>
    <HeaderButtons route={route} />
  </View>
);

const CreateKeyHeaderButton = connect(
  null,
  (dispatch, {route}) => ({
    createKey: () => dispatch(Actions.addKeyToObject({address: route.action.address, name: route.action.name})),
  })
)(({createKey}) => (
  <HeaderButton
    icon="md-checkmark"
    onPress={createKey}
  />
));

const HeaderButtons = ({route}) => {
  if (route.type === 'HOME') {
    return <CreateHeaderButton />;
  }
  if (route.type === 'CREATE') {
    return <CreateBookmarkHeaderButton route={route} />;
  }
  if (route.type === 'ADD_OBJECT_KEY') {
    return <CreateKeyHeaderButton route={route} />
  }
  return null;
};


let LiquidScene = ({route}) => {
  const SceneComponent = COMPONENT_FOR_ACTION[route.type];
  if (SceneComponent) {
    return (
      <View style={{paddingTop: 64, flex:1}}>
        <SceneComponent route={route} />
      </View>
    );
  }
  return (
    <ScrollView style={LiquidStyles.scrollView}>
      <Text>route = {presentationStringify(route)}</Text>
    </ScrollView>
  );
};

function routeToTitle(route) {
  switch (route.type) {
    case 'HOME':
      return 'Liquid';
    case 'CREATE':
      return 'New Bookmark';
    case 'BOOKMARK':
      let title = route.action.name;
      if (route.action.address) {
        route.action.address.forEach(a => {
          title = title + ': ' + a;
        });
      }
      return title;
    case 'ADD_OBJECT_KEY':
      return 'New Key';
    case 'BOOKMARK_CHOOSE_TYPE':
      return 'Set Type';
    default:
      return route.key;
  }
}

const LiquidTitle = ({route, onLayout}) => (
  <Header.Title key={route.key} onLayout={onLayout}>
    {routeToTitle(route)}
  </Header.Title>
);

const LiquidBackButton = connect(
  null,
  dispatch => ({
    onBack: () => dispatch(Actions.back()),
  }),
)(({onBack}) => (
  <HeaderButton
    icon="ios-arrow-back"
    onPress={onBack}
  />
));

import type {NavigationState} from 'NavigationTypeDefinition';

const LiquidMain = connect(
  store => ({
    navigationState: store.navigationState,
  }),
  dispatch => ({
    back: () => dispatch(Actions.back()),
  }),
)(({back, navigationState}) => (
  <CardStack
    onNavigateBack={back}
    navigationState={navigationState}
    renderScene={sceneProps => <LiquidScene route={sceneProps.scene.route} />}
    renderOverlay={sceneProps => (
      <Header
        renderTitleComponent={({scene, onLayout}) => <LiquidTitle route={scene.route} onLayout={onLayout} />}
        renderRightComponent={({scene}) => <LiquidRightHeader route={scene.route} />}
        renderLeftComponent={({scene, navigationState}) => navigationState.index === 0 ? null : <LiquidBackButton />}
        onNavigateBack={back}
        {...sceneProps}
      />
    )}
    style={LiquidStyles.navigator}
  />
));

class LiquidApp extends React.Component {
  _store = createStore(LiquidAppReducer, undefined, autoRehydrate());
  componentDidMount() {
    let lastNavigationState = null;
    persistStore(this._store, {storage: AsyncStorage});
    this._store.subscribe(() => {
      const store = this._store.getState();
      if (store.navigationState !== lastNavigationState) {
        dismissKeyboard();
        lastNavigationState = store.navigationState;
      }
      console.log('Store update: ', store);
    });
    AppState.addEventListener("change", (newState) => {
      newState === "active" && codePush.sync();
    });
    codePush.sync();
  }
  render() {
    return (
      <Provider store={this._store}>
        <LiquidMain />
      </Provider>
    );
  }
}

const LiquidStyles = StyleSheet.create({
  headerButton: {
    padding: 8,
    marginLeft: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    marginTop: 3,
  },
  headerButtonIcon: {
    width: 24,
    height: 24,
  },
  navigator: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

module.exports = LiquidApp;
