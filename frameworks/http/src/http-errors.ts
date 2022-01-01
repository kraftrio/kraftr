import { STATUS_CODES } from 'node:http';
import { Readable } from 'node:stream';

export enum HttpStatus {
  Continue = 100,
  SwitchingProtocols = 101,
  OK = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  TemporaryRedirect = 307,
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  PayloadTooLarge = 413,
  URITooLong = 414,
  UnsupportedMediaType = 415,
  RangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  MisdirectedRequest = 421,
  UnprocessableEntity = 422,
  Locked = 423,
  FailedDependency = 424,
  UnorderedCollection = 425,
  UpgradeRequired = 426,
  PreconditionRequired = 428,
  TooManyRequests = 429,
  RequestHeaderFieldsTooLarge = 431,
  UnavailableForLegalReasons = 451,
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HTTPVersionNotSupported = 505,
  VariantAlsoNegotiates = 506,
  InsufficientStorage = 507,
  LoopDetected = 508,
  BandwidthLimitExceeded = 509,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511
}

export class HttpException extends Readable implements Error {
  public name: string;
  public message: string;
  public body: unknown;

  constructor(public response: unknown, public statusCode: HttpStatus) {
    super({ objectMode: true });
    this.body =
      typeof response === 'string'
        ? {
            statusCode,
            message: response
          }
        : response;
    this.name = STATUS_CODES[statusCode] ?? 'Unknown Error';
    this.message = typeof response === 'string' ? response : this.name;
  }

  override _read(): void {
    this.push(this.body);
    this.push(null);
  }
}

export namespace HttpException {
  export class BadRequest extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.BadRequest], HttpStatus.BadRequest);
    }
  }
  export class Unauthorized extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.Unauthorized], HttpStatus.Unauthorized);
    }
  }
  export class PaymentRequired extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.PaymentRequired], HttpStatus.PaymentRequired);
    }
  }
  export class Forbidden extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.Forbidden], HttpStatus.Forbidden);
    }
  }
  export class NotFound extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.NotFound], HttpStatus.NotFound);
    }
  }
  export class MethodNotAllowed extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.MethodNotAllowed], HttpStatus.MethodNotAllowed);
    }
  }
  export class NotAcceptable extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.NotAcceptable], HttpStatus.NotAcceptable);
    }
  }
  export class ProxyAuthenticationRequired extends HttpException {
    constructor() {
      super(
        STATUS_CODES[HttpStatus.ProxyAuthenticationRequired],
        HttpStatus.ProxyAuthenticationRequired
      );
    }
  }
  export class RequestTimeout extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.RequestTimeout], HttpStatus.RequestTimeout);
    }
  }
  export class Conflict extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.Conflict], HttpStatus.Conflict);
    }
  }
  export class Gone extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.Gone], HttpStatus.Gone);
    }
  }
  export class LengthRequired extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.LengthRequired], HttpStatus.LengthRequired);
    }
  }
  export class PreconditionFailed extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.PreconditionFailed], HttpStatus.PreconditionFailed);
    }
  }
  export class PayloadTooLarge extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.PayloadTooLarge], HttpStatus.PayloadTooLarge);
    }
  }
  export class URITooLong extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.URITooLong], HttpStatus.URITooLong);
    }
  }
  export class UnsupportedMediaType extends HttpException {
    constructor() {
      super(
        STATUS_CODES[HttpStatus.UnsupportedMediaType],
        HttpStatus.UnsupportedMediaType
      );
    }
  }
  export class RangeNotSatisfiable extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.RangeNotSatisfiable], HttpStatus.RangeNotSatisfiable);
    }
  }
  export class ExpectationFailed extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.ExpectationFailed], HttpStatus.ExpectationFailed);
    }
  }
  export class ImATeapot extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.ImATeapot], HttpStatus.ImATeapot);
    }
  }
  export class MisdirectedRequest extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.MisdirectedRequest], HttpStatus.MisdirectedRequest);
    }
  }
  export class UnprocessableEntity extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.UnprocessableEntity], HttpStatus.UnprocessableEntity);
    }
  }
  export class Locked extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.Locked], HttpStatus.Locked);
    }
  }
  export class FailedDependency extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.FailedDependency], HttpStatus.FailedDependency);
    }
  }
  export class UnorderedCollection extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.UnorderedCollection], HttpStatus.UnorderedCollection);
    }
  }
  export class UpgradeRequired extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.UpgradeRequired], HttpStatus.UpgradeRequired);
    }
  }
  export class PreconditionRequired extends HttpException {
    constructor() {
      super(
        STATUS_CODES[HttpStatus.PreconditionRequired],
        HttpStatus.PreconditionRequired
      );
    }
  }
  export class TooManyRequests extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.TooManyRequests], HttpStatus.TooManyRequests);
    }
  }
  export class RequestHeaderFieldsTooLarge extends HttpException {
    constructor() {
      super(
        STATUS_CODES[HttpStatus.RequestHeaderFieldsTooLarge],
        HttpStatus.RequestHeaderFieldsTooLarge
      );
    }
  }
  export class UnavailableForLegalReasons extends HttpException {
    constructor() {
      super(
        STATUS_CODES[HttpStatus.UnavailableForLegalReasons],
        HttpStatus.UnavailableForLegalReasons
      );
    }
  }
  export class InternalServerError extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.InternalServerError], HttpStatus.InternalServerError);
    }
  }
  export class NotImplemented extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.NotImplemented], HttpStatus.NotImplemented);
    }
  }
  export class BadGateway extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.BadGateway], HttpStatus.BadGateway);
    }
  }
  export class ServiceUnavailable extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.ServiceUnavailable], HttpStatus.ServiceUnavailable);
    }
  }
  export class GatewayTimeout extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.GatewayTimeout], HttpStatus.GatewayTimeout);
    }
  }
  export class HTTPVersionNotSupported extends HttpException {
    constructor() {
      super(
        STATUS_CODES[HttpStatus.HTTPVersionNotSupported],
        HttpStatus.HTTPVersionNotSupported
      );
    }
  }
  export class VariantAlsoNegotiates extends HttpException {
    constructor() {
      super(
        STATUS_CODES[HttpStatus.VariantAlsoNegotiates],
        HttpStatus.VariantAlsoNegotiates
      );
    }
  }
  export class InsufficientStorage extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.InsufficientStorage], HttpStatus.InsufficientStorage);
    }
  }
  export class LoopDetected extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.LoopDetected], HttpStatus.LoopDetected);
    }
  }
  export class BandwidthLimitExceeded extends HttpException {
    constructor() {
      super(
        STATUS_CODES[HttpStatus.BandwidthLimitExceeded],
        HttpStatus.BandwidthLimitExceeded
      );
    }
  }
  export class NotExtended extends HttpException {
    constructor() {
      super(STATUS_CODES[HttpStatus.NotExtended], HttpStatus.NotExtended);
    }
  }
  export class NetworkAuthenticationRequired extends HttpException {
    constructor() {
      super(
        STATUS_CODES[HttpStatus.NetworkAuthenticationRequired],
        HttpStatus.NetworkAuthenticationRequired
      );
    }
  }
}
