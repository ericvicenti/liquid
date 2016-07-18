/**
 * @flow
 */

import Icon from 'react-native-vector-icons/Ionicons';
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
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import type {NavigationState} from 'NavigationTypeDefinition';

// Clipboard.getString().then(t => console.log('CC', t));

const {CardStack, Header} = NavigationExperimental;

import {persistStore, autoRehydrate} from 'redux-persist'

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

import LqScene from './LqScene';
import LqRightHeader from './LqRightHeader';
import LqRow from './LqRow';
import LqStringEditScene from './LqStringEditScene';
import LqStyles from './LqStyles';
import LqActions from './LqActions';
import LqStore from './LqStore';
import LqHeaderButton from './LqHeaderButton';

import type {
  LqRoute,
  LqNavigationState,
} from './LqTypes';


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

// class LqAppIconPicker extends Component {
//   render() {
//     return (
//       <ScrollView style={LqStyles2.container}>
//         <Text style={LqStyles2.welcome}>
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

// const LqStyles2 = StyleSheet.create({
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




class ListSceneWithFilter extends React.Component {
  state = {filter: ''};
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ScrollView style={LqStyles.scrollView} keyboardDismissMode="interactive">
        <View style={{backgroundColor: 'white', height: 40, margin: 5, borderRadius: 20, flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, borderColor: '#999' }}>
          <TextInput
            value={this.state.filter}
            style={{flex: 1, paddingLeft: 47, marginRight: 5}}
            placeholder="Search Types"
            clearButtonMode="always"
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

const ChooseTypeScene = connect(
  store => ({
    types: Object.keys(store.bookmarks).sort().map(name => {
      // const thing = store.objects[store.bookmarks[name]];
      return dereferenceBookmark(store, name);
    }),
  }),
  dispatch => ({
    setType: (name, address, nodeType) => dispatch(LqActions.createBookmark({name, address, nodeType})),
  })
)(({setType, types, route}) => {
  return (
    <ListSceneWithFilter
      rows={types.filter(isTypey).map((type, i) => ({
        view:
          <LqRow
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


const AddObjectKeyScene = connect(
  ({bookmarks, objects}, {route}) => ({
    keyName: objects[bookmarks.__keyNameDraft],
  }),
  dispatch => ({
    setKeyName: name => dispatch(LqActions.setBookmarkValue({name: '__keyNameDraft', value: name})),
  }),
)(({setKeyName, keyName}) => {
  return (
    <LqStringEditScene
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
    setDraftName: name => dispatch(LqActions.setBookmarkValue({name: '__bookmarkNameDraft', value: name})),
  }),
)(({bookmarkName, setDraftName}) => {
  return (
    <LqStringEditScene
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
    openMenu: ({deleteBookmark, name, renameBookmark, chooseType}) => {
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
    },
    chooseType: name => dispatch(LqActions.bookmarkChooseType({name})),
    deleteBookmark: name => dispatch(LqActions.deleteBookmark({name})),
    openBookmark: name => dispatch(LqActions.openBookmark({name})),
    renameBookmark: (name, newName) => dispatch(LqActions.renameBookmark({name, newName})),
  })
)(({...props, rows, openBookmark, openMenu}) => (
  <ListSceneWithFilter
    rows={rows.filter(r => r.name.indexOf('__') !== 0).map(({name, value, color, icon}) => ({
      view: (
        <LqRow
          key={name}
          label={`${name} : ${presentationStringify(value)}`}
          color={color || '#333'}
          icon={icon}
          onPress={() => openBookmark(name)}
          onLongPress={() => openMenu({...props, name})}
        />
      ),
      searchString: name,
    }))}
  />
));

const COMPONENT_FOR_ACTION = {
  HOME: BookmarksScene,
  CREATE: CreateBookmarkScene,
  BOOKMARK: LqScene,
  ADD_OBJECT_KEY: AddObjectKeyScene,
  BOOKMARK_CHOOSE_TYPE: ChooseTypeScene,
};

let LqAppScene = ({route}: {route: LqRoute}) => {
  const SceneComponent = COMPONENT_FOR_ACTION[route.type];
  if (SceneComponent) {
    return (
      <View style={{paddingTop: 64, flex:1}}>
        <SceneComponent route={route} />
      </View>
    );
  }
  return (
    <ScrollView style={LqStyles.scrollView}>
      <Text>route = {presentationStringify(route)}</Text>
    </ScrollView>
  );
};

function routeToTitle(route: LqRoute) {
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

const LqTitle = ({route, onLayout}) => (
  <Header.Title key={route.key} onLayout={onLayout}>
    {routeToTitle(route)}
  </Header.Title>
);

const LqLeftHeader = connect(
  null,
  dispatch => ({
    onBack: () => dispatch(LqActions.back()),
  }),
)(({onBack, navigationState}) => {
  if (navigationState.index === 0) {
    return null;
  }
  return (
    <LqHeaderButton
      icon="ios-arrow-back"
      onPress={onBack}
    />
  );
});

const LqAppStack = connect(
  store => ({
    navigationState: store.navigationState,
  }),
  dispatch => ({
    back: () => dispatch(LqActions.back()),
  }),
)(({back, navigationState}) => (
  <CardStack
    onNavigateBack={back}
    navigationState={navigationState}
    renderScene={sceneProps => <LqAppScene route={sceneProps.scene.route} />}
    renderOverlay={sceneProps => (
      <Header
        renderTitleComponent={({scene, onLayout}) => <LqTitle route={scene.route} onLayout={onLayout} />}
        renderRightComponent={({scene}) => <LqRightHeader route={scene.route} />}
        renderLeftComponent={props => <LqLeftHeader {...props}/>}
        onNavigateBack={back}
        {...sceneProps}
      />
    )}
    style={LqStyles.navigator}
  />
));

class LqApp extends React.Component {
  _store = createStore(LqStore, undefined, autoRehydrate());
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
        <LqAppStack />
      </Provider>
    );
  }
}

module.exports = LqApp;
