declare module "papaparse" {
  export type ParseError = {
    code: string;
    message: string;
    row?: number;
    type: string;
  };

  export type ParseResult<T> = {
    data: T[];
    errors: ParseError[];
    meta: {
      fields?: string[];
    };
  };

  export function parse<T>(
    input: string,
    config?: {
      header?: boolean;
      skipEmptyLines?: boolean;
      transformHeader?: (header: string) => string;
    }
  ): ParseResult<T>;
}
