/**
 * @flow
 */

import LqInputWithKeyboardScene from './LqInputWithKeyboardScene';
import React from 'react'

import {
  extractNativeValue,
} from './LqUtils';

type Props = {
  onSet: (v: any) => void,
  value: any,
  editable?: boolean,
};

const LqStringEditScene = ({editable, value, onSet}: Props) => (
  <LqInputWithKeyboardScene
    color="#70A04A"
    placeholder="Empty number"
    keyboardType="numeric"
    editable={editable}
    onChange={(t) => {
      const val = Number(t);
      if (Number.isNaN(val)) {
        return;
      }
      onSet(val);
    }}
    value={extractNativeValue(value)}
  />
);

module.exports = LqStringEditScene;
