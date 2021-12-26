export type HttpResponse = {
  code: number;
  description: string;
  content: unknown;
};

export function defineOk(response: HttpResponse) {}
export function defineNotFound(response: HttpResponse) {}
export function defineResponse(response: HttpResponse) {}
