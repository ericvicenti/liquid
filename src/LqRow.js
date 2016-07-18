/*
 * @flow
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import Icon, {glyphMap} from 'react-native-vector-icons/Ionicons';

type Props = {
  color?: string,
  icon?: string,
  onPress?: () => void,
  onLongPress?: ?() => void,
  label: string,
};

const LqRow = ({color, icon, onPress, onLongPress, label}: Props) => (
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

module.exports = LqRow;
