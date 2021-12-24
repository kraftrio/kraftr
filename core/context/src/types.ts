export type AnyObject = Record<string, unknown>;
export type isAnyObject<T, True, False> = AnyObject extends T ? True : False;
export type isBoolean<T, True, False> = T extends boolean ? True : False;
export type isAny<T, True, False> = unknown extends T ? True : False;
export type isString<T, True, False> = string extends T ? True : False;
