# 🍰 TypeCake

TypeCake is a language that compiles to TypeScript types.

> Still in progress.

## Examples

You can open [playground](https://typecake.vercel.app/) to edit and compile the code on-the-fly.

### Declaring "type" function

[Playground](https://typecake.vercel.app/?code=H4sIAAAAAAAAA0vLU3Az1NBUsFXIK81NSi2yVtDXVyhOzc1Mzs_Jz1PILFbILyjJzM9LzOHiSgOqNdIIASkOgfCMNUKsFIpLijLz0pFETTRCgBwMYVOEYjRpADAFjSqFAAAA)

```rust
fn F1() = X; // semicolon is optional

fn F2(T) = T

fn F3(T: string) = T

fn F4(T = string) = T

fn F5(T: string = string) = T
```

compiles to TypeScript:

```ts
type F1 = X;

type F2<T> = T;

type F3<T extends string> = T;

type F4<T = string> = T;

type F5<T extends string = string> = T;
```

### Declaring object type

[Playground](https://typecake.vercel.app/?code=H4sIAAAAAAAAA0vLU3BJLEnU0FSwVahWSLRSKC4pysxL11FIsrdSyCvNTUot0lGIroCJx1oplOZl5-WX5ynUcnGl5SkEFOUXpBaVVDqCTQAZFa2eqB6LLOWEJJUElAIAoqFYM3MAAAA)

```rust
fn Data() = { a: string, b?: number, [x: string]: unknown }
```

compiles to TypeScript:

```ts
type Data = {
  a: string,
  b?: number,
  [x: string]: unknown
};
```

### If expression

[Playground](https://typecake.vercel.app/?code=H4sIAAAAAAAAA11PTQuCQBC9-yveqVUQSa1L0DXoGh67KK4p2W64KxHRf29qXD-Cucz7mHmvUjjEfoA9mgrCCOxgbNeoC14eIHLhvSFbI3ktaPW8ijyJnw2m7M9i68aAhrHRPygLrVuZq6V0AJe_tK1lB_u8S_f0JE3fWk5LAfhBMDGJY4Z7Myp1lOpvhewCLpH6WRwiS1yTeKqyWhFOK-s5EfFjL-Sq_CoIYEm0TH9EqdVZWFyVfkTLBhsOk_pChFjPUm4dUeV06Md9ADiSQZagAQAA)

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

compiles to TypeScript:

```ts
type F1 = 's' extends string ? 'a' : 'b';

type F2<T> = T extends string ? 'a' : T extends boolean ? 'b' : 'c';
```

### Switch expression (pattern matching)

[Playground](https://typecake.vercel.app/?code=H4sIAAAAAAAAA2WNwQqCQBRF9_MVdzcKBmm7oDaBHxDuREJjTEnfhDODSPTvOepkEbzFe-c87i0JJ2lIe8kehu4ke0ozHweovtbXCgmeDEgzbI7YBnbNaZiu0F0BHIosutiNtyPjAXsxVhLi0Ev-MpXuarpNz7qqFcaZEbcphZSNyOlHL4yvLVJXooMeHuLTdRbKNDr0bN_YO0f6q4mcWdK-1M4pMm0hOp-9AeU_KoMdAQAA)

```rust
fn F1(T) = switch T {
  string -> 'a',
  boolean -> 'b',
  _ -> 'c',
}

fn F2(T: unknown[]) = switch T {
  [] -> unknown,
  [&First] -> First,
  [any, &Second] -> Second,
  _ -> never,
}
```

compiles to TypeScript:

```ts
type F1<T> = T extends string ? 'a' : T extends boolean ? 'b' : 'c';

type F2<T extends unknown[]> = T extends [] ? unknown : T extends [infer First] ? First : T extends [any, infer Second] ? Second : never;
```

### For expression

[Playground](https://typecake.vercel.app/?code=H4sIAAAAAAAAA0vLU3Az1NBUsFVIyy9S8FbIzFNQT87JTM5WV6gBsjIS89JT1RWquRQUEvLzdFWqvWsTuGq5uNKA2owIakssBulSqXZOLMgsSczJrErV8NasTQAb5w00BgC743aYfQAAAA)

```rust
fn F2() = for K in 'click' | 'change' as `on${Capitalize(K)}` {
  K
}
```

compiles to TypeScript:

```ts
type F2 = { [K in 'click' | 'change' as `on${Capitalize<K>}`]: K };
```

### Const-In expression

[Playground](https://typecake.vercel.app/?code=H4sIAAAAAAAAA0vLU3DT0FSw5VJQSM7PKy5RCDFUsFUITi3RKC4pysxL19QBykBAiBFQxrGoKLFSI680Nym1SBMolZmnkJkG0mQFkq8GK44OMYwFMmoVUnOKU-FiRmAxLgBZkttDcQAAAA)

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

compiles to TypeScript:

```ts
type F<T> = MyType<1> extends infer T1 ? MyType<2> extends infer T2 ? T1 extends T2 ? [T1] : [T2] : never : never;
```

### Pipeline Expression

[Playground](https://typecake.vercel.app/?code=H4sIAAAAAAAAA0vLU3DT0FSwVcgrzU1KLeJSUKixUwgoys_NLE6FcIJTSyCMoNTk_KIUjeKSosy8dE0uADxNif86AAAA)

```fsharp
fn F() = number
  |> Promise
  |> Set
  |> Record(string)
```

compiles to TypeScript:

```ts
type F = Record<string, Set<Promise<number>>>;
```

### Macro

> Experimental. Not implemented yet.

```rust
fn F() = union!(string, number)
```

### Import declaration

[Playground](https://typecake.vercel.app/?code=H4sIAAAAAAAAA0srys9VUE9UV8jMLcgvKlFI5EoDiyTBRbQUEosVkqDCyXDhaoUKHYVKkFyVQi1UNgUum6IDVJCro5AHlAMAxhXmOmMAAAA)

```python
from 'a' import a
from 'b' import * as b
from 'c' import { x, y as z }
from 'd' import d, { m, n }
```

compiles to TypeScript:

```ts
import a from 'a';
import * as b from 'b';
import { x, y as z } from 'c';
import d, { m, n } from 'd';
```

## License

MIT License

2021-present (c) Pig Fang
