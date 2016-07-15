const sha256 = require('crypto-js/sha256');
const stringify = require('json-stable-stringify');

export function keyOfObject(input) {
  return sha256(stringify(input)).toString();
}

export function isTypey(val) {
  return val && (
    val.ClassName
  );
}

export function setBookmark(store, name, address, value) {
  const {bookmarks, objects} = store;
  const oldValue = objects[bookmarks[name]];
  let newValue = value;
  if (address) {
    let innerValue = value;
    let deeperValue = oldValue;
    let objectsToMutate = address.map((a, i) => {
      return deeperValue[a];
    }, newValue).reverse();
    address.reverse().forEach((addressKey, addressIndex) => {
      let last = objectsToMutate[addressIndex + 1];
      if (addressIndex + 1 === address.length) {
        last = oldValue;
      }
      newValue = {
        ...last,
        [addressKey]: newValue,
      };
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


function createRef(store, name) {
  const key = store.bookmarks[name];
  return {
    __nodeType: 'ref',
    key,
    name,
  };
}


export function getDefaultValue(store, nodeType) {
  const fullNodeType = dereference(store, nodeType);
  if (fullNodeType.NativeType) {
    return fullNodeType.NativeTypeDefaultValue;
  }
  return {
    __nodeType: fullNodeType.__ref,
  };
}

export function dereference(store, thing) {
  if (thing == null) {
    return null;
  }
  const primitiveType = typeof thing;
  if (primitiveType !== 'object') {
    const typeName = `primitive_${primitiveType}`;
    return {
      __nodeType: createRef(store, typeName),
      value: thing,
    };
  }
  if (thing instanceof Array) {
    const things = thing.map(subThing => dereference(store, subThing));
    return things;
  }
  if (thing && thing.__nodeType === 'ref') {
    return {
      ...store.objects[thing.key],
      __ref: thing,
    };
  }
  return thing;
}

export function dereferenceBookmark(store, name, address) {
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

export function extractNativeValue(v) {
  if (v && v.__nodeType) {
    return v.value;
  }
  if (v instanceof Array || typeof v !== 'object') {
    return v;
  }
  return null;
}
