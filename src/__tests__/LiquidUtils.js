jest.disableAutomock();
  // .dontMock('../LiquidUtils')
  // .dontMock('crypto-js/sha256');
import {
  keyOfObject,
  isTypey,
  setBookmark,
} from '../LiquidUtils';
 
describe('keyOfObject', () => {

  it('should find correct hash for null', () => {
    expect(keyOfObject(null))
      .toBe('74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b');
  });

  it('should find key reliably for similar objects', () => {
    expect(keyOfObject({baz: 47, foo: 'bar'}))
      .toBe(keyOfObject({foo: 'bar', baz: 47}));
  });

});


describe('isTypey', () => {

});

describe('setBookmark', () => {

  it('should set a simple value', () => {
    const store = {
      bookmarks: {},
      objects: {},
    };
    const out = setBookmark(store, 'foo', null, 47);
    expect(out.objects[out.bookmarks.foo]).toBe(47);
  });

  it('should set a value with address', () => {
    const store = {
      bookmarks: {
        foo: 'asdf',
      },
      objects: {
        asdf: {
          bar: 'before',
        },
      },
    };
    const out = setBookmark(store, 'foo', ['bar'], 47);
    expect(out.objects[out.bookmarks.foo].bar).toBe(47);
  });

  it('should set a value with deep address', () => {
    const store = {
      bookmarks: {
        foo: 'asdf',
      },
      objects: {
        asdf: {
          bar: {
            baz: 'before',
            a: 'unchanged',
          },
        },
      },
    };
    const out = setBookmark(store, 'foo', ['bar', 'baz'], 47);
    expect(out.objects[out.bookmarks.foo].bar.baz).toBe(47);
    expect(out.objects[out.bookmarks.foo].bar.a).toBe('unchanged');
  });

  it('should set a value with really deep address', () => {
    const store = {
      bookmarks: {
        foo: 'asdf',
      },
      objects: {
        asdf: {
          bar: {
            baz: {
              boo: 'before',
            },
            a: 'unchanged',
          },
        },
      },
    };
    const out = setBookmark(store, 'foo', ['bar', 'baz', 'boo'], 47);
    expect(out.objects[out.bookmarks.foo].bar.baz.boo).toBe(47);
    expect(out.objects[out.bookmarks.foo].bar.a).toBe('unchanged');
  });
});