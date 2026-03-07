import { describe, it, expect } from 'bun:test'
import { dispatch, Dispatch } from '../src/index'

describe('dispatch', () => {
  it('dispatch(type...) returns a dispatch object with the specified types', () => {
    const d = dispatch('foo', 'bar')
    expect(d instanceof Dispatch).toBe(true)
  })

  it('dispatch(type...) does not throw an error if a specified type name collides with a dispatch method', () => {
    const d = dispatch('on')
    expect(d instanceof Dispatch).toBe(true)
  })

  it('dispatch(type...) throws an error if a specified type name is illegal', () => {
    expect(() => { dispatch('__proto__') }).toThrow()
    expect(() => { dispatch('hasOwnProperty') }).toThrow()
    expect(() => { dispatch('') }).toThrow()
    expect(() => { dispatch('foo.bar') }).toThrow()
    expect(() => { dispatch('foo bar') }).toThrow()
    expect(() => { dispatch('foo\tbar') }).toThrow()
  })

  it('dispatch(type...) throws an error if a specified type name is a duplicate', () => {
    expect(() => { dispatch('foo', 'foo') }).toThrow()
  })

  it('dispatch(type).call(type, object, arguments...) invokes callbacks of the specified type', () => {
    let foo = 0
    let bar = 0
    const d = dispatch('foo', 'bar').on('foo', function() { ++foo }) as Dispatch
    ;(d.on('bar', function() { ++bar }) as Dispatch)
    d.call('foo')
    expect(foo).toBe(1)
    expect(bar).toBe(0)
    d.call('foo')
    d.call('bar')
    expect(foo).toBe(2)
    expect(bar).toBe(1)
  })

  it('dispatch(type).call(type, object, arguments...) invokes callbacks with specified arguments and context', () => {
    const results: { this: unknown, arguments: unknown[] }[] = []
    const foo = {}
    const bar = {}
    const d = dispatch('foo').on('foo', function(this: unknown) { results.push({ this: this, arguments: [].slice.call(arguments) }) }) as Dispatch
    d.call('foo', foo, bar)
    expect(results).toEqual([{ this: foo, arguments: [bar] }])
    d.call('foo', bar, foo, 42, 'baz')
    expect(results).toEqual([{ this: foo, arguments: [bar] }, { this: bar, arguments: [foo, 42, 'baz'] }])
  })

  it('dispatch(type).call(type, object, arguments...) invokes callbacks in the order they were added', () => {
    const results: string[] = []
    const d = dispatch('foo')
    d.on('foo.a', function() { results.push('A') })
    d.on('foo.b', function() { results.push('B') })
    d.call('foo')
    d.on('foo.c', function() { results.push('C') })
    d.on('foo.a', function() { results.push('A') }) // move to end
    d.call('foo')
    expect(results).toEqual(['A', 'B', 'B', 'C', 'A'])
  })

  it('dispatch(type).call(type, object, arguments...) returns undefined', () => {
    const d = dispatch('foo')
    expect(d.call('foo')).toBe(undefined)
  })

  it('dispatch(type).apply(type, object, arguments) invokes callbacks of the specified type', () => {
    let foo = 0
    let bar = 0
    const d = dispatch('foo', 'bar').on('foo', function() { ++foo }) as Dispatch
    ;(d.on('bar', function() { ++bar }) as Dispatch)
    d.apply('foo')
    expect(foo).toBe(1)
    expect(bar).toBe(0)
    d.apply('foo')
    d.apply('bar')
    expect(foo).toBe(2)
    expect(bar).toBe(1)
  })

  it('dispatch(type).apply(type, object, arguments) invokes callbacks with specified arguments and context', () => {
    const results: { this: unknown, arguments: unknown[] }[] = []
    const foo = {}
    const bar = {}
    const d = dispatch('foo').on('foo', function(this: unknown) { results.push({ this: this, arguments: [].slice.call(arguments) }) }) as Dispatch
    d.apply('foo', foo, [bar])
    expect(results).toEqual([{ this: foo, arguments: [bar] }])
    d.apply('foo', bar, [foo, 42, 'baz'])
    expect(results).toEqual([{ this: foo, arguments: [bar] }, { this: bar, arguments: [foo, 42, 'baz'] }])
  })

  it('dispatch(type).apply(type, object, arguments) invokes callbacks in the order they were added', () => {
    const results: string[] = []
    const d = dispatch('foo')
    d.on('foo.a', function() { results.push('A') })
    d.on('foo.b', function() { results.push('B') })
    d.apply('foo')
    d.on('foo.c', function() { results.push('C') })
    d.on('foo.a', function() { results.push('A') }) // move to end
    d.apply('foo')
    expect(results).toEqual(['A', 'B', 'B', 'C', 'A'])
  })

  it('dispatch(type).apply(type, object, arguments) returns undefined', () => {
    const d = dispatch('foo')
    expect(d.apply('foo')).toBe(undefined)
  })

  it('dispatch(type).on(type, f) returns the dispatch object', () => {
    const d = dispatch('foo')
    expect(d.on('foo', function() {})).toBe(d)
  })

  it('dispatch(type).on(type, f) replaces an existing callback, if present', () => {
    let foo = 0
    let bar = 0
    const d = dispatch('foo', 'bar')
    d.on('foo', function() { ++foo })
    d.call('foo')
    expect(foo).toBe(1)
    expect(bar).toBe(0)
    d.on('foo', function() { ++bar })
    d.call('foo')
    expect(foo).toBe(1)
    expect(bar).toBe(1)
  })

  it('dispatch(type).on(type, f) replacing an existing callback with itself has no effect', () => {
    let foo = 0
    const FOO = function() { ++foo }
    const d = dispatch('foo').on('foo', FOO) as Dispatch
    d.call('foo')
    expect(foo).toBe(1)
    ;(d.on('foo', FOO) as Dispatch).on('foo', FOO)
    d.on('foo', FOO)
    d.call('foo')
    expect(foo).toBe(2)
  })

  it('dispatch(type).on(type., ...) is equivalent to dispatch(type).on(type, ...)', () => {
    const d = dispatch('foo')
    let foos = 0
    let bars = 0
    const foo = function() { ++foos }
    const bar = function() { ++bars }
    expect(d.on('foo.', foo)).toBe(d)
    expect(d.on('foo.')).toBe(foo)
    expect(d.on('foo')).toBe(foo)
    expect(d.on('foo.', bar)).toBe(d)
    expect(d.on('foo.')).toBe(bar)
    expect(d.on('foo')).toBe(bar)
    expect(d.call('foo')).toBe(undefined)
    expect(foos).toBe(0)
    expect(bars).toBe(1)
    expect(d.on('.', null)).toBe(d)
    expect(d.on('foo')).toBe(undefined)
    expect(d.call('foo')).toBe(undefined)
    expect(foos).toBe(0)
    expect(bars).toBe(1)
  })

  it('dispatch(type).on(type, null) removes an existing callback, if present', () => {
    let foo = 0
    const d = dispatch('foo', 'bar')
    d.on('foo', function() { ++foo })
    d.call('foo')
    expect(foo).toBe(1)
    d.on('foo', null)
    d.call('foo')
    expect(foo).toBe(1)
  })

  it('dispatch(type).on(type, null) does not remove a shared callback', () => {
    let a = 0
    const A = function() { ++a }
    const d = dispatch('foo', 'bar').on('foo', A) as Dispatch
    d.on('bar', A)
    d.call('foo')
    d.call('bar')
    expect(a).toBe(2)
    d.on('foo', null)
    d.call('bar')
    expect(a).toBe(3)
  })

  it('dispatch(type).on(type, null) removing a missing callback has no effect', () => {
    let a = 0
    const d = dispatch('foo')
    function A() { ++a }
    ;(d.on('foo.a', null) as Dispatch).on('foo', A)
    d.on('foo', null)
    d.on('foo', null)
    d.call('foo')
    expect(a).toBe(0)
  })

  it('dispatch(type).on(type, null) during a callback does not invoke the old callback', () => {
    let a = 0
    let b = 0
    let c = 0
    const d = dispatch('foo')
    const A = function() { ++a; d.on('foo.B', null) } // remove B
    const B = function() { ++b }
    d.on('foo.A', A)
    d.on('foo.B', B)
    d.call('foo')
    expect(a).toBe(1)
    expect(b).toBe(0)
    expect(c).toBe(0)
  })

  it('dispatch(type).on(type, f) during a callback does not invoke the old or the new callback', () => {
    let a = 0
    let b = 0
    let c = 0
    const d = dispatch('foo')
    const C = function() { ++c }
    const A = function() { ++a; d.on('foo.B', C) } // replace B with C
    const B = function() { ++b }
    d.on('foo.A', A)
    d.on('foo.B', B)
    d.call('foo')
    expect(a).toBe(1)
    expect(b).toBe(0)
    expect(c).toBe(0)
  })

  it('dispatch(type).on(type, f) during a callback does not invoke the new callback', () => {
    let a = 0
    let b = 0
    const d = dispatch('foo')
    const B = function() { ++b }
    const A = function() { ++a; d.on('foo.B', B) } // add B
    d.on('foo.A', A)
    d.call('foo')
    expect(a).toBe(1)
    expect(b).toBe(0)
  })

  it('dispatch(type).on(type, f) coerces type to a string', () => {
    const f = function() {}
    const g = function() {}
    const d = dispatch('null', 'undefined')
    d.on('null', f)
    d.on('undefined', g)
    expect(d.on('null')).toBe(f)
    expect(d.on('undefined')).toBe(g)
  })

  it('dispatch("foo", "bar").on("foo bar", f) adds a callback for both types', () => {
    let foos = 0
    const foo = function() { ++foos }
    const d = dispatch('foo', 'bar').on('foo bar', foo) as Dispatch
    expect(d.on('foo')).toBe(foo)
    expect(d.on('bar')).toBe(foo)
    d.call('foo')
    expect(foos).toBe(1)
    d.call('bar')
    expect(foos).toBe(2)
  })

  it('dispatch("foo").on("foo.one foo.two", f) adds a callback for both typenames', () => {
    let foos = 0
    const foo = function() { ++foos }
    const d = dispatch('foo').on('foo.one foo.two', foo) as Dispatch
    expect(d.on('foo.one')).toBe(foo)
    expect(d.on('foo.two')).toBe(foo)
    d.call('foo')
    expect(foos).toBe(2)
  })

  it('dispatch("foo", "bar").on("foo bar") returns the callback for either type', () => {
    const foo = function() {}
    const d = dispatch('foo', 'bar')
    d.on('foo', foo)
    expect(d.on('foo bar')).toBe(foo)
    expect(d.on('bar foo')).toBe(foo)
    d.on('foo', null)
    d.on('bar', foo)
    expect(d.on('foo bar')).toBe(foo)
    expect(d.on('bar foo')).toBe(foo)
  })

  it('dispatch("foo").on("foo.one foo.two") returns the callback for either typename', () => {
    const foo = function() {}
    const d = dispatch('foo')
    d.on('foo.one', foo)
    expect(d.on('foo.one foo.two')).toBe(foo)
    expect(d.on('foo.two foo.one')).toBe(foo)
    expect(d.on('foo foo.one')).toBe(foo)
    expect(d.on('foo.one foo')).toBe(foo)
    d.on('foo.one', null)
    d.on('foo.two', foo)
    expect(d.on('foo.one foo.two')).toBe(foo)
    expect(d.on('foo.two foo.one')).toBe(foo)
    expect(d.on('foo foo.two')).toBe(foo)
    expect(d.on('foo.two foo')).toBe(foo)
  })

  it('dispatch("foo").on(".one .two", null) removes the callback for either typename', () => {
    const foo = function() {}
    const d = dispatch('foo')
    d.on('foo.one', foo)
    d.on('foo.two', foo)
    d.on('foo.one foo.two', null)
    expect(d.on('foo.one')).toBe(undefined)
    expect(d.on('foo.two')).toBe(undefined)
  })

  it('dispatch(type).on(type, f) throws an error if f is not a function', () => {
    expect(() => { dispatch('foo').on('foo', 42 as any) }).toThrow()
  })

  it('dispatch(...).on(type, f) throws an error if the type is unknown', () => {
    expect(() => { dispatch('foo').on('bar', () => {}) }).toThrow()
    expect(() => { dispatch('foo').on('__proto__', () => {}) }).toThrow()
  })

  it('dispatch(...).on(type) throws an error if the type is unknown', () => {
    expect(() => { dispatch('foo').on('bar') }).toThrow()
    expect(() => { dispatch('foo').on('__proto__') }).toThrow()
  })

  it('dispatch(type).on(type) returns the expected callback', () => {
    const d = dispatch('foo')
    function A() {}
    function B() {}
    function C() {}
    ;(d.on('foo.a', A) as Dispatch).on('foo.b', B)
    d.on('foo', C)
    expect(d.on('foo.a')).toBe(A)
    expect(d.on('foo.b')).toBe(B)
    expect(d.on('foo')).toBe(C)
  })

  it('dispatch(type).on(.name) returns undefined when retrieving a callback', () => {
    const d = dispatch('foo').on('foo.a', function() {}) as Dispatch
    expect(d.on('.a')).toBe(undefined)
  })

  it('dispatch(type).on(.name, null) removes all callbacks with the specified name', () => {
    const d = dispatch('foo', 'bar')
    const a = {}
    const b = {}
    const c = {}
    const those: unknown[] = []
    function A() { those.push(a) }
    function B() { those.push(b) }
    function C() { those.push(c) }
    ;((d.on('foo.a', A) as Dispatch).on('bar.a', B) as Dispatch).on('foo', C)
    d.on('.a', null)
    d.call('foo')
    d.call('bar')
    expect(those).toEqual([c])
  })

  it('dispatch(type).on(.name, f) has no effect', () => {
    const d = dispatch('foo', 'bar')
    const a = {}
    const b = {}
    const those: unknown[] = []
    function A() { those.push(a) }
    function B() { those.push(b) }
    ;((d.on('.a', A) as Dispatch).on('foo.a', B) as Dispatch).on('bar', B)
    d.call('foo')
    d.call('bar')
    expect(those).toEqual([b, b])
    expect(d.on('.a')).toBe(undefined)
  })

  it('dispatch(type...).copy() returns an isolated copy', () => {
    const foo = function() {}
    const bar = function() {}
    const d0 = dispatch('foo', 'bar').on('foo', foo) as Dispatch
    d0.on('bar', bar)
    const d1 = d0.copy()
    expect(d1.on('foo')).toBe(foo)
    expect(d1.on('bar')).toBe(bar)

    // Changes to d1 don't affect d0.
    expect(d1.on('bar', null)).toBe(d1)
    expect(d1.on('bar')).toBe(undefined)
    expect(d0.on('bar')).toBe(bar)

    // Changes to d0 don't affect d1.
    expect(d0.on('foo', null)).toBe(d0)
    expect(d0.on('foo')).toBe(undefined)
    expect(d1.on('foo')).toBe(foo)
  })
})
