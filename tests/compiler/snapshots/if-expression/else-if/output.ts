type Check<T> = T extends string ? 'a string' : T extends number ? 'a number' : 'something else';
