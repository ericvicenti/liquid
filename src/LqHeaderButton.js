/**
 * @flow
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import LqStyles from './LqStyles';

const LqHeaderButton = ({onPress, icon}: {onPress: ()=>void, icon: string}) => {
  return (
    <TouchableOpacity
      style={LqStyles.headerButton}
      onPress={onPress}>
      <Icon
        name={icon}
        size={24}
        color="#444"
        style={LqStyles.headerButtonIcon}
      />
    </TouchableOpacity>
  );
}

module.exports = LqHeaderButton;
