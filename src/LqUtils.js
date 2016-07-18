/*
 * @flow
 */

const sha256 = require('crypto-js/sha256');
const stringify = require('json-stable-stringify');


import type {
  LqAddress,
  LqStore,
  LqName,
  LqValue,
  LqNavigationState,
} from './LqTypes';

export function keyOfObject(input: LqValue) {
  return sha256(stringify(input)).toString();
}

export function isTypey(val: LqValue) {
  return val && (
    val.ClassName
  );
}

export function presentationStringify(val: LqValue): string {
  if (typeof val !== 'object') {
    return stringify(val);
  }
  const valToPresent = {...val};
  Object.keys(valToPresent).forEach(k => {
    if (k.indexOf('__') === 0) {
      delete valToPresent[k];
    }
  });
  return stringify(valToPresent);
}

export function setBookmark(store: LqStore, name: LqName, address: LqAddress, value: LqValue) {
  const {bookmarks, objects} = store;
  const oldValue = objects[bookmarks[name]];
  let newValue = value;
  if (address) {
    let innerValue = value;
    let deeperValue = oldValue;
    let objectsToMutate = address.map((a, i) => {
      return (typeof deeperValue === 'object') ? deeperValue[a] : deeperValue;
    }, newValue).reverse();
    address.reverse().forEach((addressKey, addressIndex) => {
      let last = objectsToMutate[addressIndex + 1];
      if (addressIndex + 1 === address.length) {
        last = oldValue;
      }
      if (last instanceof Array) {
        const innerValue = newValue;
        newValue = [...last];
        newValue[addressKey] = innerValue;
      } else {
        newValue = {
          ...last,
          [addressKey]: newValue,
        };
      }
    });
  }
  const key = keyOfObject(newValue);
  return {
    ...store,
    bookmarks: {
      ...bookmarks,
      [name]: key,
    },
    objects: {
      ...objects,
      [key]: newValue,
    },
  };
}

export function deleteBookmark(store: LqStore, name: LqName) {
  if (store.bookmarks[name] == null) {
    return store;
  }
  return {
    ...store,
    bookmarks: {
      ...store.bookmarks,
      [name]: null,
    },
  };
}

export function lookupAddress(value: LqValue, address: LqAddress) {
  let outputValue = value;
  if (address) {
    address.forEach(a => {
      if (outputValue != null) {
        outputValue = outputValue[a];
      }
    });
  }
  return outputValue;
}

function createRef(store: LqStore, name: LqName) {
  const key = store.bookmarks[name];
  return {
    __nodeType: 'ref',
    key,
    name,
  };
}

export function getNodeType(store: LqStore, value: LqValue) {
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

export function getDefaultValue(store: LqStore, nodeType: LqValue): ?LqValue {
  const fullNodeType = dereference(store, nodeType);
  if (fullNodeType && fullNodeType.NativeType) {
    return fullNodeType.NativeTypeDefaultValue;
  }
  return {
    __nodeType: fullNodeType.__ref,
  };
}

export function dereference(store: LqStore, value: LqValue) {
  if (value == null) {
    return null;
  }
  const primitiveType = typeof value;
  if (primitiveType !== 'object') {
    const typeName = `primitive_${primitiveType}`;
    return {
      __nodeType: createRef(store, typeName),
      value,
    };
  }
  if (value instanceof Array) {
    const values = value.map(subValue => dereference(store, subValue));
    return values;
  }
  if (value && value.__nodeType === 'ref') {
    return {
      ...store.objects[value.key],
      __ref: value,
    };
  }
  return value;
}

export function dereferenceBookmark(store: LqStore, name: LqName, address?: LqAddress) {
  const key = store.bookmarks[name];
  let value = dereference(store, store.objects[key]);
  if (value && !value.__ref) {
    value.__ref = {
      __nodeType: 'ref',
      name,
      key,
    };
  }
  if (address) {
    address.forEach((a) => {
      value = value[a];
    });
  }
  return value;
}

export function extractNativeValue(v: LqValue) {
  if (v && v.__nodeType) {
    return v.value;
  }
  if (v instanceof Array || typeof v !== 'object') {
    return v;
  }
  return null;
}
