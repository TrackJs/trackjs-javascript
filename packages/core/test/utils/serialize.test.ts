import { describe, expect, test } from 'vitest';
import { serialize } from '../../src/utils/serialize';

test.each([
  ["", '""'],
  ["some \"string\"", '"some \\"string\\""'],
  [new String("constructed string"), '"constructed string"'],
  ["string\nnewlines\t\tand\rspecial\\characters",'"string\\nnewlines\\t\\tand\\rspecial\\\\characters"'],
  [0, "0"],
  [42, "42"],
  [32.12, "32.12"],
  [new Number(85), "85"],
  [BigInt('9007199254740993'),'9007199254740993n'],
  [Infinity, "Infinity"],
  [-Infinity, "-Infinity"],
  [NaN, "NaN"],
  [true, "true"],
  [false, "false"],
  [new Boolean(false), "false"],
  [undefined, "undefined"],
  [null, "null"],
  [Symbol(), "Symbol()"],
  [Symbol("foo"), "Symbol(foo)"],
  [/test/gi, "/test/gi"],
  [new RegExp("^(group)[a-z]{1}$", "gi"), "/^(group)[a-z]{1}$/gi"],
  [new Date("2025-01-01T00:00:00.000Z"), "2025-01-01T00:00:00.000Z"],
  [new Error("Oops"), "[Error: Oops]"],
  [new RangeError("Oops"), "[RangeError: Oops]"],
  [Promise.resolve(), "[Promise]"],
  [[], "[]"],
  [[1,2,3], "[1,2,3]"],
  [[42, "some string", false, undefined, /test/gi], "[42,\"some string\",false,undefined,/test/gi]"],
  [new Array(3), "[undefined,undefined,undefined]"],
  [new Array(1,2,3), "[1,2,3]"],
  [{}, "{}"],
  [{ foo: "bar" }, "{\"foo\":\"bar\"}"],
  [new Object(), "{}"],
  [function() {}, "function() {\n  }"],
  [function xxx(foo: any, bar: any): string { return "baz"; }, "function xxx(foo, bar) {\n    return \"baz\";\n  }"],
  [(foo: any, bar: any) => { return; }, "(foo, bar) => {\n    return;\n  }"],
  [() => "result", "() => \"result\""],
  [async () => { await Promise.resolve(); }, "async () => {\n    await Promise.resolve();\n  }"]
])('serialize(%o) -> "%s"', (thing, expected) => {
  expect(serialize(thing)).toBe(expected);
});

test('serialize global object', () => {
  expect(serialize(globalThis)).toBe('[Global]');
})

describe('serializing complex objects', () => {

  test('serialize objects with non-enumerable properties', () => {
    const obj = { visible: 'yes' };
    Object.defineProperty(obj, 'hidden', {
      value: 'no',
      enumerable: false
    });
    expect(serialize(obj)).toBe('{"visible":"yes"}');
  });

  test('serialize objects with deep nesting', () => {
    const object = {
      "first level": {
        "second level": {
          "third level": {
            "fourth level": {
              "fifth level": "some value"
            }
          }
        }
      }
    };
    expect(serialize(object, { depth: 5 })).toBe('{"first level":{"second level":{"third level":{"fourth level":{"fifth level":"some value"}}}}}');
    expect(serialize(object, { depth: 4 })).toBe('{"first level":{"second level":{"third level":{"fourth level":{Object}}}}}');
    expect(serialize(object, { depth: 3 })).toBe('{"first level":{"second level":{"third level":{Object}}}}');
    expect(serialize(object, { depth: 2 })).toBe('{"first level":{"second level":{Object}}}');
    expect(serialize(object, { depth: 1 })).toBe('{"first level":{Object}}');
  });

  test('serialize mixed objects with deep nesting', () => {
    const mixed = {
      "first level": [
        "second level",
        {
          "third level": [
            "fourth level",
            {
              "fifth level": "some value"
            }
          ]
        }
      ]
    };
    expect(serialize(mixed, { depth: 5 })).toBe('{"first level":["second level",{"third level":["fourth level",{"fifth level":"some value"}]}]}');
    expect(serialize(mixed, { depth: 4 })).toBe('{"first level":["second level",{"third level":["fourth level",{Object}]}]}');
    expect(serialize(mixed, { depth: 3 })).toBe('{"first level":["second level",{"third level":[Array]}]}');
    expect(serialize(mixed, { depth: 2 })).toBe('{"first level":["second level",{Object}]}');
    expect(serialize(mixed, { depth: 1 })).toBe('{"first level":[Array]}');
  });

  test('serialize objects with multiple references', () => {
    const obj = {"foo":"bar"};
    const object = {
      "todd": "rules",
      "thing": obj,
      "other thing": obj
    };
    expect(serialize(object)).toBe('{"todd":"rules","thing":{"foo":"bar"},"other thing":{Object}}');
  });

  test('serialize arrays with circular references', () => {
    let obj1: any = {"foo":"bar"};
    let obj2 = {"todd":"rules","thing":obj1};
    obj1["thing"] = obj2;
    expect(serialize(obj1)).toBe('{"foo":"bar","thing":{"todd":"rules","thing":{Object}}}');
    expect(serialize(obj2)).toBe('{"todd":"rules","thing":{"foo":"bar","thing":{Object}}}');
  });

  test('serialize object that throws when properties are accessed', () => {
    // Create an object that throws an error when any property is accessed
    const throwingObject = new Proxy({}, {
      get(target, prop) {
        throw new Error(`Cannot access property ${String(prop)}`);
      },
      ownKeys(target) {
        return ['dangerousProperty', 'anotherProperty'];
      },
      has(target, prop) {
        return true;
      },
      getOwnPropertyDescriptor(target, prop) {
        return {
          enumerable: true,
          configurable: true
        };
      }
    });

    expect(() => serialize(throwingObject)).not.toThrow();
    expect(serialize(throwingObject)).toBe("[Unserializable]");
  });

})

describe('serializing complex arrays', () => {

  test('serialize arrays with deep nesting', () => {
    const array = [
      "first level",
      [
        "second level",
        [
          "third level",
          [
            "fourth level",
            [
              "fifth level"
            ]
          ]
        ]
      ]
    ];
    expect(serialize(array, { depth: 5 })).toBe('["first level",["second level",["third level",["fourth level",["fifth level"]]]]]');
    expect(serialize(array, { depth: 4 })).toBe('["first level",["second level",["third level",["fourth level",[Array]]]]]');
    expect(serialize(array, { depth: 3 })).toBe('["first level",["second level",["third level",[Array]]]]');
    expect(serialize(array, { depth: 2 })).toBe('["first level",["second level",[Array]]]');
    expect(serialize(array, { depth: 1 })).toBe('["first level",[Array]]');
  });

  test('serialize arrays with multiple references', () => {
    const arr1 = ["foo","bar"];
    const array = ["baz", arr1, 42, arr1, arr1];
    expect(serialize(array)).toBe('["baz",["foo","bar"],42,[Array],[Array]]');
  });

  test('serialize arrays with circular references', () => {
    let arr1 : any[] = ["foo","bar"];
    let arr2 : any[] = ["todd","rules",arr1];
    arr1.push(arr2);
    expect(serialize(arr1)).toBe('["foo","bar",["todd","rules",[Array]]]');
    expect(serialize(arr2)).toBe('["todd","rules",["foo","bar",[Array]]]');
  });

});

describe('serializing with custom handlers', () => {

  test('serializes with first passing handler', () => {
    const handler1 = {
      test: (thing: any) => false,
      serialize: (thing: any) => "handler1"
    };
    const handler2 = {
      test: (thing: any) => true,
      serialize: (thing: any) => "handler2"
    };
    const handler3 = {
      test: (thing: any) => false,
      serialize: (thing: any) => "handler3"
    };
    expect(serialize("something", { handlers: [handler1, handler2, handler3] })).toBe("handler2");
  });

  test('uses default serializer if no handlers pass', () => {
    const handler1 = {
      test: (thing: any) => false,
      serialize: (thing: any) => "handler1"
    };
    expect(serialize(42, { handlers: [handler1] })).toBe("42");
  })

});
