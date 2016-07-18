/**
 * @flow
 */

import React from 'react';
import {
  Text,
  View,
} from 'react-native';

const LqErrorScene = ({message}: {message: string}) => (
  <View style={{flex: 1, alignItems: 'center', flexDirection: 'row', padding: 20}}>
    <Text style={{textAlign: 'center', flex: 1, color: '#888', fontSize: 24}}>{message}</Text>
  </View>
);

module.exports = LqErrorScene;
