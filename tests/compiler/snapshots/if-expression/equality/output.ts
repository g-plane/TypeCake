type IsAny<T> = (<__T>() => __T extends T ? 1 : 2) extends (<__T>() => __T extends any ? 1 : 2) ? true : false;
