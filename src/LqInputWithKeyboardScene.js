/**
 * @flow
 */

import React, {Component} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  Keyboard,
} from 'react-native';

import {
  extractNativeValue,
} from './LqUtils';

class LqInputWithKeyboardScene extends React.Component {
  _input: TextInput;
  state: {
    keyboardHeight: number;
  } = {
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
  onKeyboardChange: (eventType: string, e: {endCoordinates: {height: number}}) => void = (eventType, e) => {
    let keyboardHeight = e.endCoordinates.height;
    if (eventType === 'hide') {
      keyboardHeight = 0;
    }
    this.setState({
      keyboardHeight,
    });
  };
  render: () => any = () => (
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

module.exports = LqInputWithKeyboardScene;