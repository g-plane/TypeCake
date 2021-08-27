# typacro

> DSL that generates TypeScript types.

> Still in progress.

## Examples

### Define "type" function

```rust
fn F1() = X; // semicolon is optional

fn F2(T) = T

fn F3(T: string) = T

fn F4(T = string) = T

fn F5(T: string = string) = T
```

### If expression

```rust
fn F1() = if 's' : string {
  'a'
} else {
  'b'
}

fn F2(T) = if T : string {
  'a'
} else if T : boolean {
  'b'
} else {
  'c'
}
```

### Switch expression

```rust
fn F(T) = switch T {
  string -> 'a',
  boolean -> 'b',
  _ -> 'c',
}
```

### Const-In expression

```rust
fn F(T) =
  const T1 = MyType(1),
        T2 = MyType(2)
  in if T1 : T2 {
    [T1]
  } else {
    [T2]
  }
```

### Macro

> Experimental.

```rust
fn F() = .union(string, number)
```

### Import declaration

```python
from 'a' import a
from 'b' import * as b
from 'c' import { x, y as z }
from 'd' import d, { m, n }
```

## License

MIT License

2021-present (c) Pig Fang
