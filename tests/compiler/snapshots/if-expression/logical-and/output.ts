type IsString<T> = T extends string ? T extends number ? never : any : any;
