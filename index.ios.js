  /**
 * @flow
 */

import Icon, {glyphMap} from 'react-native-vector-icons/Ionicons';
import React, { Component } from 'react';
import {
  AppState,
  AsyncStorage,
  Alert,
  AppRegistry,
  ScrollView,
  StyleSheet,
  NavigationExperimental,
  Text,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  Switch,
  View,
  TextInput,
} from 'react-native';
import codePush from "react-native-code-push";
const dismissKeyboard = require('dismissKeyboard');
import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
// AsyncStorage.clear();

const stringify = require('json-stable-stringify');
const {CardStack, Header, StateUtils} = NavigationExperimental;

function presentationStringify(a) {
  return stringify(a);
}

import {persistStore, autoRehydrate} from 'redux-persist'

const sha256 = require('crypto-js/sha256');

function makeHash(input) {
  return sha256(input).toString();
}

class LiquidAppIconPicker extends Component {
  render() {
    return (
      <ScrollView style={LiquidStyles2.container}>
        <Text style={LiquidStyles2.welcome}>
          Choose an icon:
        </Text>
        <Text style={{padding: 10}}>
          {Object.keys(glyphMap).map(iconName => <Text onPress={() => Alert.alert(iconName)}>
            {' '}<Icon name={iconName} size={48} color="#4F8EF7" />{' '}
          </Text>)}
        </Text>
      </ScrollView>
    );
  }
}

const LiquidStyles2 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});


const PUSH_ACTIONS = [
  'ADD_OBJECT_KEY',
  'CREATE',
  'BOOKMARK',
];

function NavState(state = {
  index: 0,
  routes: [{key: 'Welcome', type: 'HOME'}],
}, action) {
  const {type} = action;
  if (PUSH_ACTIONS.indexOf(type) !== -1) {
    const route = {
      key: `${type}-${Date.now()}`,
      state: action,
      type,
    };
    return StateUtils.push(state, route);
  }
  switch (type) {
    case 'BACK':
    case 'CREATE_BOOKMARK':
    case 'ADD_KEY_TO_OBJECT':
      return StateUtils.pop(state);
    case 'SAVE':
      return {
        ...state,
        index: 0,
        routes: [state.routes[0]],
      };
    default:
      return state;
  }
}

const BUILT_IN_TYPES = {
  primitive_string: {
    name: 'Text',
    nativeType: 'string',
    color: '#9C664A',
    icon: 'md-quote',
  },
  primitive_number: {
    name: 'Number',
    nativeType: 'number',
    color: '#70A04A',
    icon: 'ios-timer',
  },
  primitive_boolean: {
    name: 'Toggle',
    nativeType: 'boolean',
    color: '#4A6A9D',
    icon: 'ios-checkmark-circle',
  },
  primitive_object: {
    name: 'Object',
    nativeType: 'object',
    color: '#9D7A4A',
    icon: 'ios-book-outline',
  },
  primitive_array: {
    name: 'List',
    nativeType: 'array',
    color: '#9C457E',
    icon: 'ios-list-outline',
  },
};

const BUILT_IN_BOOKMARKS = {
  ...BUILT_IN_TYPES,

  types: Object.keys(BUILT_IN_TYPES).map(type => ({
    __nodeType: 'ref',
    bookmark: type,
    key: makeHash(stringify(BUILT_IN_TYPES[type])),
  })),

  // primitive_type: {
  //   type: 'type',
  //   color: '#453559',
  //   icon: 'ios-funnel',
  // }

  foo: 'bar',
  baz: false,
  such: {
    fun: true,
  },
};
const DEFAULT_BOOKMARKS = {};
const DEFAULT_OBJECTS = {};

Object.keys(BUILT_IN_BOOKMARKS).map(bookmarkName => {
  const value = BUILT_IN_BOOKMARKS[bookmarkName];
  const stringValue = stringify(value);
  const key = makeHash(stringValue);
  DEFAULT_OBJECTS[key] = value;
  DEFAULT_BOOKMARKS[bookmarkName] = key;
});

function Bookmarks(state = DEFAULT_BOOKMARKS, action) {
  const {type} = action;
  switch (type) {
    case 'SAVE':
      return state;
    default:
      return state;
  }
}

function Objects(state = DEFAULT_OBJECTS, action) {
  const {type} = action;
  switch (type) {
    case 'foo':
      return state;
    default:
      return state;
  }
}

const LiquidAppReducer = (state, action) => {
  const newState = combineReducers({
    navigationState: NavState,
    bookmarks: Bookmarks,
    objects: Objects,
  })(state, action);
  const {bookmarks, objects} = newState;
  switch (action.type) {
    case 'CREATE_BOOKMARK': {
      const value = null;
      const stringValue = stringify(value);
      const key = makeHash(stringValue);
      const bookmarkName = newState.objects[newState.bookmarks.__bookmarkNameDraft];
      const route = {
        key: `BOOKMARK-${Date.now()}`,
        state: {
          bookmark: bookmarkName,
        },
        type: 'BOOKMARK',
      };
      return {
        ...newState,
        bookmarks: {
          ...newState.bookmarks,
          [bookmarkName]: key,
          __bookmarkNameDraft: null,
        },
        objects: {
          ...newState.objects,
          [key]: value,
        },
        navigationState: StateUtils.push(newState.navigationState, route),
      };
      return newState;
    }
    case 'ADD_KEY_TO_OBJECT': {
      const {bookmark} = action;
      
      const newKeyName = newState.objects[newState.bookmarks.__keyNameDraft];
      const oldObject = newState.objects[newState.bookmarks[bookmark]];
      const newObject = {
        ...oldObject,
        [newKeyName]: null,
      };
      const stringValue = stringify(newObject);
      const key = makeHash(stringValue);
      return {
        ...newState,
        bookmarks: {
          ...newState.bookmarks,
          __keyNameDraft: null,
          [bookmark]: key,
        },
        objects: {
          ...newState.objects,
          [key]: newObject,
        },
      };      
    }
    case 'SET_BOOKMARK_VALUE': {
      const {address, value, bookmark} = action;
      const oldValue = newState.objects[newState.bookmarks[bookmark]];
      let newValue = value;
      if (address) {
        address.forEach((a, i) => {
          let someV = oldValue; //todo: look up
          let subValue = newValue;
          if (someV instanceof Array) {
            newValue = [...someV];
          } else {
            newValue = {...someV};
          }
          newValue[a] = subValue;
        });
      }
      const stringValue = stringify(newValue);
      const key = makeHash(stringValue);

      return {
        ...newState,
        bookmarks: {
          ...newState.bookmarks,
          [bookmark]: key,
        },
        objects: {
          ...newState.objects,
          [key]: newValue,
        },
      };
    }
    default:
      return newState;
  }
}

const Actions = {
  addKeyToObject({address, bookmark}) {
    return {type: 'ADD_KEY_TO_OBJECT', address, bookmark};
  },
  setBookmarkValue({bookmark, address, value}) {
    return {type: 'SET_BOOKMARK_VALUE', bookmark, address, value};
  },
  openBookmark({bookmark, address}) {
    return {type: 'BOOKMARK', address, bookmark};
  },
  addObjectKey({bookmark, address}) {
    return {type: 'ADD_OBJECT_KEY', address, bookmark};
  },
  back() {
    return {type: 'BACK'};
  },
  createBookmark() {
    return {type: 'CREATE_BOOKMARK'};
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

const AwesomeRow = ({color, icon, onPress, label}) => (
  <TouchableHighlight
    style={{borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd'}}
    onPress={onPress}>
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
)

function dereference(store, thing) {
  if (typeof thing !== 'object') {
    return thing;
  }
  if (thing instanceof Array) {
    return thing.map(subThing => dereference(store, subThing));
  }
  if (thing && thing.__nodeType === 'ref') {
    return {
      ...thing,
      value: store.objects[thing.key],
    };
  }
  return thing;
}

function dereferenceBookmark(store, name, address) {
  const key = store.bookmarks[name];
  let value = dereference(store, store.objects[key]);
  if (address) {
    address.forEach((a) => {
      value = value[a];
    });
  }
  return value;
}

function extractNativeValue(v) {
  if (v && v.value !== undefined) {
    return v.value;
  }
  return v;
}

const NullEditor = connect(
  store => ({
    types: dereferenceBookmark(store, 'types'),
  }),
)(({createWithType, onSet, types}) => {
  return (
    <ListSceneWithFilter
      rows={types.map((type) => ({
        view:
          <AwesomeRow
            key={type.key}
            onPress={() => onSet({value: null, __nodeType: {key: type.key, bookmark: type.bookmark} })}
            label={`New ${type.value.name}`}
            icon={type.value.icon}
            color={type.value.color}
          />,
        searchString: type.value.name+' '+type.bookmark,
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

const DEFAULT_TYPE = {
  color: '#999',
  icon: null,
};

const ObjectEditor = connect(
  (store, {value}) => ({
    rows: Object.keys(value).sort().map(key => ({
      type: DEFAULT_TYPE,
      value: value[key],
      key,
    })),
  }),
  (dispatch, {route}) => ({
    addKey: () => dispatch(Actions.addObjectKey({bookmark: route.state.bookmark, address: route.state.address})),
    openKey: (name) => {
      let {address, bookmark} = route.state;
      address = address || [];
      dispatch(Actions.openBookmark({bookmark, address: [...address, name]}));
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

const ArrayEditor = connect(
  (store, {value}) => {
    value = extractNativeValue(value) || [];
    return {
      value,
      rows: value.map((item, index) => ({
        type: DEFAULT_TYPE,
        value: value[index],
        index,
      })),
    };
  },
  (dispatch, {route}) => ({
    addKey: () => dispatch(Actions.addObjectKey({bookmark: route.state.bookmark, address: route.state.address})),
    openKey: (name) => {
      let {address, bookmark} = route.state;
      address = address || [];
      dispatch(Actions.openBookmark({bookmark, address: [...address, name]}));
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
        label="Object Empty"
        color="#aaa"
      />
    )
  }
  things.push(
    <AwesomeRow
      label="Add Item"
      onPress={() => onSet([...value, null])}
    />
  )
  return (
    <ScrollView style={[LiquidStyles.scrollView, {backgroundColor: 'white'}]}>
      {things}
    </ScrollView>
  );
});

class StringEditor extends React.Component {
  _input: TextInput;
  componentDidMount() {
    setTimeout(() => {this.setState({});}, 100);
    setTimeout(() => {
      this._input && this._input.focus();
    }, 500);
  }
  render = () => (
    <ScrollView style={{flex: 1, backgroundColor: 'white', padding: 20}} keyboardDismissMode="interactive">
      <TextInput
        placeholder={this.props.placeholder || "Empty text"}
        ref={input => {this._input = input;}}
        multiline
        style={{flex: 1, marginTop: 64}}
        onChange={(e) => {
          this.props.onSet(e.nativeEvent.text);
        }}>
          <Text style={{fontSize: 18, color: '#9C664A'}}>{this.state ? extractNativeValue(this.props.value) : " "}</Text>
      </TextInput>
    </ScrollView>
  );
}

class NumberEditor extends React.Component {
  _input: TextInput;
  state: ?{};
  componentDidMount() {
    setTimeout(() => {this.setState({});}, 100);
    setTimeout(() => {
      this._input && this._input.focus();
    }, 500);
  }
  componentDidUpdate() {
    if (this.state) {
      this.state = null;
      this.forceUpdate();
    }
  }
  render = () => (
    <ScrollView style={{flex: 1, backgroundColor: 'white', padding: 20}} keyboardDismissMode="interactive">
      <TextInput
        placeholder={this.props.placeholder || "Empty number"}
        ref={input => {this._input = input;}}
        multiline
        keyboardType="numeric"
        style={{flex: 1, marginTop: 64}}
        onChange={(e) => {
          const val = Number(e.nativeEvent.text);
          if (Number.isNaN(val)) {
            this.state = this.state ? null : {};
            this.forceUpdate();
            return;
          }
          this.props.onSet(val);
        }}>
          <Text style={{fontSize: 18, color: '#70A04A'}}>{this.state ? extractNativeValue(this.props.value) + ' ' : extractNativeValue(this.props.value)}</Text>
      </TextInput>
    </ScrollView>
  );
}

function getEditorForNativeType(type) {
  switch (type) {
    case 'boolean':
      return BooleanEditor;
    case 'string':
      return StringEditor;
    case 'array':
      return ArrayEditor;
    case 'object':
      return ObjectEditor;
    case 'number':
      return NumberEditor;
    default:
      return null;
  }
}

function getEditorForType(nodeType) {
  if (nodeType == null) {
    return NullEditor;
  }
  const {nativeType} = nodeType;
  if (nativeType && getEditorForNativeType(nativeType)) {
    return getEditorForNativeType(nativeType);
  }
  return () => <ErrorScene message={`There is no editor defined for "${nodeType.name}" type.`} />;
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
  if (value.__nodeType && value.__nodeType.key) {
    const {bookmark, key} = value.__nodeType;
    return dereference(store, {
      __nodeType: 'ref',
      bookmark,
      key,
    }).value;
  }
  if (value.__nodeType) {
    return value.__nodeType;
  }
  return dereferenceBookmark(store, 'primitive_object');
}

const BookmarkScene = connect(
  (store, {route}) => {
    const {bookmarks, objects} = store;
    let value = objects[bookmarks[route.state.bookmark]];
    if (route.state.address) {
      route.state.address.forEach(a => {
        value = value[a];
      });
    }
    const nodeType = getNodeType(store, value);
    return { value, nodeType };
  },
  (dispatch, {route}) => ({
    updateValue: (value) => {
      dispatch(Actions.setBookmarkValue({bookmark: route.state.bookmark, address: route.state.address, value}));
    },
  }),
)(({route, value, nodeType, updateValue}) => {
  const Editor = getEditorForType(nodeType);
  return (
    <Editor
      value={value}
      route={route}
      onSet={updateValue}
    />
  );
});


const AddObjectKeyScene = connect(
  ({bookmarks, objects}, {route}) => ({
    keyName: objects[bookmarks.__keyNameDraft],
  }),
  dispatch => ({
    setKeyName: name => dispatch(Actions.setBookmarkValue({bookmark: '__keyNameDraft', value: name})),
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
  ({bookmarks, objects}, {route}) => ({
    bookmarkName: objects[bookmarks.__bookmarkNameDraft],
  }),
  dispatch => ({
    setDraftName: name => dispatch(Actions.setBookmarkValue({bookmark: '__bookmarkNameDraft', value: name})),
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
      const value = store.objects[store.bookmarks[name]];
      const nodeType = getNodeType(store, value);
      return {name, value, nodeType};
    }),
  }),
  dispatch => ({
    openBookmark: bookmark => dispatch(Actions.openBookmark({bookmark}))
  })
)(({rows, openBookmark}) => (
  <ListSceneWithFilter
    rows={rows.map(({name, value}) => ({
      view: (
        <AwesomeRow
          key={name}
          label={`${name} : ${presentationStringify(value)}`}
          color={'#333'}
          onPress={() => openBookmark(name)}
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
  null,
  (dispatch, {route}) => ({
    createBookmark: () => dispatch(Actions.createBookmark()),
  }),
)(({createBookmark}) => (
  <HeaderButton
    icon="md-checkmark"
    onPress={createBookmark}
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
    createKey: () => dispatch(Actions.addKeyToObject({address: route.state.address, bookmark: route.state.bookmark})),
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

const LiquidScene = ({route}) => {
  const SceneComponent = COMPONENT_FOR_ACTION[route.type];
  if (SceneComponent) {
    return (
      <SceneComponent route={route} />
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
      return 'Liquid Bookmarks';
    case 'CREATE':
      return 'New Bookmark:';
    case 'BOOKMARK':
      let title = route.state.bookmark;
      if (route.state.address) {
        route.state.address.forEach(a => {
          title = title + ': ' + a;
        });
      }
      return title;
    case 'ADD_OBJECT_KEY':
      return 'New Key';
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
    marginTop: 64
  },
});

// AppRegistry.registerComponent('Liquid', () => LiquidAppIconPicker);
AppRegistry.registerComponent('Liquid', () => LiquidApp);

module.exports = LiquidApp;
