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
AsyncStorage.clear();

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
  if (newState === state) {
    return state;
  }
  const {bookmarks, objects} = newState;
  switch (action.type) {
    case 'CREATE_BOOKMARK':
      // ookmarks
      return newState;
    case 'SET_BOOKMARK_NAME_DRAFT':

      action.name
      debugger;
      return newState;
    case 'SAVE':
      // const {bookmarks, objects} = newState;
      return newState;
      // let value = drafts[action.nodeType];
      // if (value == null) {
      //   value = primitiveValueDefault(action.nodeType);
      // }
      // const stringValue = stringify(value);
      // const key = makeHash(stringValue);
      // const name = drafts.bookmark;
      // return {
      //   ...newState,
      //   bookmarks: {
      //     ...bookmarks,
      //     [name]: key,
      //   },
      //   objects: {
      //     ...objects,
      //     [key]: value,
      //   },
      // };
    default:
      return newState;
  }
}

const Actions = {
  setBookmarkNameDraft(name) {
    return {type: 'SET_BOOKMARK_NAME_DRAFT', name};
  },
  openBookmark(name, editLocation) {
    return {type: 'BOOKMARK', name};
  },
  back() {
    return {type: 'BACK'};
  },
  save(nodeType) {
    return {type: 'SAVE', nodeType};
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
  if (thing.__nodeType === 'ref') {
    return store.objects[thing.key];
  }
  return thing;
}

function dereferenceBookmark(store, name) {
  const key = store.bookmarks[name];
  return dereference(store, store.objects[key]);
}

// const CreateScene = connect(
//   store => ({
//     types: dereferenceBookmark(store, 'types'),
//   }),
//   dispatch => ({
//     createWithType: type => dispatch(Actions.openBookmark(`drafts/${type}`)),
//   }),
// )(({createWithType, types}) => {
//   return (
//     <ListSceneWithFilter
//       rows={types.map(({color, nativeType, name, icon}) => ({
//         view:
//           <AwesomeRow
//             key={nativeType}
//             onPress={() => createWithType(`primitive_${nativeType}`)}
//             label={`New ${name}`}
//             icon={icon}
//             color={color}
//           />,
//         searchString: nativeType,
//       }))}
//     />
//   );
// });

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
        value={value}
        onValueChange={e => onSet(e)}
      />
      <Text style={{fontSize: 20, width: 70, margin: 3, marginHorizontal: 10, color: '#4A6A9D'}}>{value ? 'True' : 'False'}</Text>
    </View>
  </ScrollView>
);

function getType(store, nodeType) {
  return store.objects[store.bookmarks[nodeType]];
}

const ObjectEditor = connect(
  (store, {value}) => ({
    rows: Object.keys(value).map(key => ({
      type: getType(store, getNodeType(value[key])),
      value: value[key],
      key,
    })),
  })
)(({rows, onSet}) => {
  let things = [];
  if (rows.length) {
    things = rows.map(({value, type, key}) =>
      <AwesomeRow
        label={`${key}: ${presentationStringify(value)}`}
        color={type.color}
        icon={type.icon}
        onPress={() => {}}
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
      onPress={() => {}}
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
          <Text style={{fontSize: 18, color: '#9C664A'}}>{this.state ? this.props.value : " "}</Text>
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
          <Text style={{fontSize: 18, color: '#70A04A'}}>{this.state ? this.props.value + ' ' : this.props.value}</Text>
      </TextInput>
    </ScrollView>
  );
}

function getEditorForType(type) {
  switch (type) {
    case 'primitive_boolean':
      return BooleanEditor;
    case 'primitive_string':
      return StringEditor;
    case 'primitive_object':
      return ObjectEditor;
    case 'primitive_number':
      return NumberEditor;
    default:
      return () => <ErrorScene message={`There is no editor defined for the "${type}" type.`} />;
  }
}

const ErrorScene = ({message}) => (
  <View style={{flex: 1, alignItems: 'center', flexDirection: 'row', padding: 20}}>
    <Text style={{textAlign: 'center', flex: 1, color: '#888', fontSize: 24}}>{message}</Text>
  </View>
);

function primitiveValueDefault(nodeType, value) {
  if (value != null) {
    return value;
  }
  switch (nodeType) {
    case 'primitive_string':
      return '';
    case 'primitive_boolean':
      return false;
    case 'primitive_number':
      return 0;
    case 'primitive_array':
      return [];
    case 'primitive_object':
      return {};
    default:
      return {__nodeType: nodeType};
  }
}

// const CreateWithTypeScene = connect(
//   ({drafts}, {route}) => ({
//     value: drafts[route.state.nodeType],
//   }),
//   dispatch => ({
//     setDraftState: (nodeType, a) => dispatch(Actions.setDraftState(nodeType, a)),
//   }),
// )(({route, value, setDraftState}) => {
//   const {nodeType} = route.state;
//   const Editor = getEditorForType(nodeType);
//   return (
//     <Editor
//       value={primitiveValueDefault(nodeType, value)}
//       onSet={(a) => setDraftState(nodeType, a)}
//     />
//   );
// });

function getNodeType(value) {
  if (typeof value !== 'object') {
    return `primitive_${typeof value}`;
  }
  if (value instanceof Array) {
    return 'primitive_array'; //maybe?
  }
  if (value.__nodeType) {
    return value.__nodeType;
  }
  return 'primitive_object';//maybe
}

const BookmarkScene = connect(
  ({bookmarks, objects}, {route}) => ({
    value: objects[bookmarks[route.state.name]],
  }),
  dispatch => ({
    updateBookmark: (nodeType, a) => dispatch(Actions.updateBookmark(nodeType, a)),
  }),
)(({route, value, updateBookmark}) => {
  let nodeType = value && getNodeType(value);
  let nodeValue = value;
  if (!nodeValue) {
    const pts = route.state.name.split('drafts/');
    if (pts.length) { // this is a hacky way to parse the bookmark
      nodeType = pts[1];
      nodeValue = primitiveValueDefault(nodeType, nodeValue);
    }
  }
  const Editor = getEditorForType(nodeType);
  return (
    <Editor
      value={nodeValue}
      route={route}
      onSet={(a) => updateBookmark(nodeType, a)}
    />
  );
});

const CreateBookmarkScene = connect(
  (store, {route}) => ({
    bookmarkName: store.bookmarks.bookmarkNameDraft,
  }),
  dispatch => ({
    setBookmarkNameDraft: name => dispatch(Actions.setBookmarkNameDraft(name)),
  }),
)(({bookmarkName, setBookmarkNameDraft}) => {
  return (
    <StringEditor
      value={bookmarkName}
      placeholder="New Bookmark Name"
      onSet={value => setBookmarkNameDraft(value)}
    />
  );
});

const BookmarksScene = connect(
  store => ({
    bookmarks: store.bookmarks,
    objects: store.objects,
  }),
  dispatch => ({
    openBookmark: name => dispatch(Actions.openBookmark(name))
  })
)(({bookmarks, objects, openBookmark}) => (
  <ListSceneWithFilter
    rows={Object.keys(bookmarks).map(name => {
      const object = objects[bookmarks[name]];
      const nodeType = getNodeType(object);
      const view =
        <AwesomeRow
          key={name}
          label={`${name} : ${presentationStringify(object)}`}
          color={'#333'}
          onPress={() => openBookmark(name)}
        />;
      return {view, searchString: name};
    })}
  />
));

const COMPONENT_FOR_ACTION = {
  HOME: BookmarksScene,
  CREATE: CreateBookmarkScene,
  BOOKMARK: BookmarkScene,
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
)(({createBookmark}) => {
  return (
    <HeaderButton
      icon="md-checkmark"
      onPress={createBookmark}
    />
  );
});

const LiquidRightHeader = ({route}) => (
  <View style={LiquidStyles.headerButtons}>
    <HeaderButtons route={route} />
  </View>
);

const HeaderButtons = ({route}) => {
  if (route.type === 'HOME') {
    return <CreateHeaderButton />;
  }
  if (route.type === 'CREATE') {
    return <CreateBookmarkHeaderButton route={route} />;
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
      return route.state.name;
    default:
      return route.key;
  }
}

const LiquidTitle = ({route, onLayout}) => (
  <Header.Title key={route.key} onLayout={onLayout}>
    {routeToTitle(route)}
  </Header.Title>
);

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

// AppRegistry.registerComponent('liquid', () => LiquidAppIconPicker);
AppRegistry.registerComponent('Liquid', () => LiquidApp);

module.exports = LiquidApp;
