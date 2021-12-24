import { ServerResponse, STATUS_CODES } from 'node:http';

export class HttpResponse {
  public name: string;
  public message: string;
  constructor(public code: number, message?: string) {
    this.name = message ?? STATUS_CODES[code] ?? 'Unknown';
    this.message = this.name;
  }

  apply(response: ServerResponse) {
    response.writeHead(this.code, this.message);
  }

  /* c8 ignore start */
  static Continue(customMsg?: string) {
    return new HttpResponse(100, customMsg ?? STATUS_CODES[100]);
  }
  static SwitchingProtocols(customMsg?: string) {
    return new HttpResponse(101, customMsg ?? STATUS_CODES[101]);
  }
  static OK(customMsg?: string) {
    return new HttpResponse(200, customMsg ?? STATUS_CODES[200]);
  }
  static Created(customMsg?: string) {
    return new HttpResponse(201, customMsg ?? STATUS_CODES[201]);
  }
  static Accepted(customMsg?: string) {
    return new HttpResponse(202, customMsg ?? STATUS_CODES[202]);
  }
  static NonAuthoritativeInformation(customMsg?: string) {
    return new HttpResponse(203, customMsg ?? STATUS_CODES[203]);
  }
  static NoContent(customMsg?: string) {
    return new HttpResponse(204, customMsg ?? STATUS_CODES[204]);
  }
  static ResetContent(customMsg?: string) {
    return new HttpResponse(205, customMsg ?? STATUS_CODES[205]);
  }
  static PartialContent(customMsg?: string) {
    return new HttpResponse(206, customMsg ?? STATUS_CODES[206]);
  }
  static MultipleChoices(customMsg?: string) {
    return new HttpResponse(300, customMsg ?? STATUS_CODES[300]);
  }
  static MovedPermanently(customMsg?: string) {
    return new HttpResponse(301, customMsg ?? STATUS_CODES[301]);
  }
  static Found(customMsg?: string) {
    return new HttpResponse(302, customMsg ?? STATUS_CODES[302]);
  }
  static SeeOther(customMsg?: string) {
    return new HttpResponse(303, customMsg ?? STATUS_CODES[303]);
  }
  static NotModified(customMsg?: string) {
    return new HttpResponse(304, customMsg ?? STATUS_CODES[304]);
  }
  static UseProxy(customMsg?: string) {
    return new HttpResponse(305, customMsg ?? STATUS_CODES[305]);
  }
  static TemporaryRedirect(customMsg?: string) {
    return new HttpResponse(307, customMsg ?? STATUS_CODES[307]);
  }

  static BadRequest(customMsg?: string) {
    return new HttpResponse(400, customMsg ?? STATUS_CODES[400]);
  }
  static Unauthorized(customMsg?: string) {
    return new HttpResponse(401, customMsg ?? STATUS_CODES[401]);
  }
  static PaymentRequired(customMsg?: string) {
    return new HttpResponse(402, customMsg ?? STATUS_CODES[402]);
  }
  static Forbidden(customMsg?: string) {
    return new HttpResponse(403, customMsg ?? STATUS_CODES[403]);
  }
  static NotFound(customMsg?: string) {
    return new HttpResponse(404, customMsg ?? STATUS_CODES[404]);
  }
  static MethodNotAllowed(customMsg?: string) {
    return new HttpResponse(405, customMsg ?? STATUS_CODES[405]);
  }
  static NotAcceptable(customMsg?: string) {
    return new HttpResponse(406, customMsg ?? STATUS_CODES[406]);
  }
  static ProxyAuthenticationRequired(customMsg?: string) {
    return new HttpResponse(407, customMsg ?? STATUS_CODES[407]);
  }
  static RequestTimeout(customMsg?: string) {
    return new HttpResponse(408, customMsg ?? STATUS_CODES[408]);
  }
  static Conflict(customMsg?: string) {
    return new HttpResponse(409, customMsg ?? STATUS_CODES[409]);
  }
  static Gone(customMsg?: string) {
    return new HttpResponse(410, customMsg ?? STATUS_CODES[410]);
  }
  static LengthRequired(customMsg?: string) {
    return new HttpResponse(411, customMsg ?? STATUS_CODES[411]);
  }
  static PreconditionFailed(customMsg?: string) {
    return new HttpResponse(412, customMsg ?? STATUS_CODES[412]);
  }
  static PayloadTooLarge(customMsg?: string) {
    return new HttpResponse(413, customMsg ?? STATUS_CODES[413]);
  }
  static URITooLong(customMsg?: string) {
    return new HttpResponse(414, customMsg ?? STATUS_CODES[414]);
  }
  static UnsupportedMediaType(customMsg?: string) {
    return new HttpResponse(415, customMsg ?? STATUS_CODES[415]);
  }
  static RangeNotSatisfiable(customMsg?: string) {
    return new HttpResponse(416, customMsg ?? STATUS_CODES[416]);
  }
  static ExpectationFailed(customMsg?: string) {
    return new HttpResponse(417, customMsg ?? STATUS_CODES[417]);
  }
  static ImATeapot(customMsg?: string) {
    return new HttpResponse(418, customMsg ?? STATUS_CODES[418]);
  }
  static MisdirectedRequest(customMsg?: string) {
    return new HttpResponse(421, customMsg ?? STATUS_CODES[421]);
  }
  static UnprocessableEntity(customMsg?: string) {
    return new HttpResponse(422, customMsg ?? STATUS_CODES[422]);
  }
  static Locked(customMsg?: string) {
    return new HttpResponse(423, customMsg ?? STATUS_CODES[423]);
  }
  static FailedDependency(customMsg?: string) {
    return new HttpResponse(424, customMsg ?? STATUS_CODES[424]);
  }
  static UnorderedCollection(customMsg?: string) {
    return new HttpResponse(425, customMsg ?? STATUS_CODES[425]);
  }
  static UpgradeRequired(customMsg?: string) {
    return new HttpResponse(426, customMsg ?? STATUS_CODES[426]);
  }
  static PreconditionRequired(customMsg?: string) {
    return new HttpResponse(428, customMsg ?? STATUS_CODES[428]);
  }
  static TooManyRequests(customMsg?: string) {
    return new HttpResponse(429, customMsg ?? STATUS_CODES[429]);
  }
  static RequestHeaderFieldsTooLarge(customMsg?: string) {
    return new HttpResponse(431, customMsg ?? STATUS_CODES[431]);
  }
  static UnavailableForLegalReasons(customMsg?: string) {
    return new HttpResponse(451, customMsg ?? STATUS_CODES[451]);
  }
  static InternalServerError(customMsg?: string) {
    return new HttpResponse(500, customMsg ?? STATUS_CODES[500]);
  }
  static NotImplemented(customMsg?: string) {
    return new HttpResponse(501, customMsg ?? STATUS_CODES[501]);
  }
  static BadGateway(customMsg?: string) {
    return new HttpResponse(502, customMsg ?? STATUS_CODES[502]);
  }
  static ServiceUnavailable(customMsg?: string) {
    return new HttpResponse(503, customMsg ?? STATUS_CODES[503]);
  }
  static GatewayTimeout(customMsg?: string) {
    return new HttpResponse(504, customMsg ?? STATUS_CODES[504]);
  }
  static HTTPVersionNotSupported(customMsg?: string) {
    return new HttpResponse(505, customMsg ?? STATUS_CODES[505]);
  }
  static VariantAlsoNegotiates(customMsg?: string) {
    return new HttpResponse(506, customMsg ?? STATUS_CODES[506]);
  }
  static InsufficientStorage(customMsg?: string) {
    return new HttpResponse(507, customMsg ?? STATUS_CODES[507]);
  }
  static LoopDetected(customMsg?: string) {
    return new HttpResponse(508, customMsg ?? STATUS_CODES[508]);
  }
  static BandwidthLimitExceeded(customMsg?: string) {
    return new HttpResponse(509, customMsg ?? STATUS_CODES[509]);
  }
  static NotExtended(customMsg?: string) {
    return new HttpResponse(510, customMsg ?? STATUS_CODES[510]);
  }
  static NetworkAuthenticationRequired(customMsg?: string) {
    return new HttpResponse(511, customMsg ?? STATUS_CODES[511]);
  }
  /* c8 ignore stop */
}
