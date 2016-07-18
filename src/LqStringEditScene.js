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
  placeholder: string,
};

let LqStringEditScene = ({value, onSet, placeholder, editable}: Props) => (
  <LqInputWithKeyboardScene
    color="#9C664A"
    placeholder={placeholder || "Empty text"}
    onChange={onSet}
    editable={editable}
    value={extractNativeValue(value)}
  />
);

module.exports = LqStringEditScene;
