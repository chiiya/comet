import { OpenApiSpec } from '../types/open-api';
import { convertObj } from 'swagger2openapi';
const parser = require('swagger-parser');

export default class Parser {
  public static async load(pathOrObject: string | object): Promise<OpenApiSpec> {
    const spec = await parser.bundle(pathOrObject, {
      resolve: { http: { withCredentials: false } },
    });

    if (spec.swagger !== undefined) {
      return this.convertSwaggerToOpenApi(spec);
    }

    return spec;
  }

  protected static convertSwaggerToOpenApi(spec: any): Promise<OpenApiSpec> {
    return new Promise<OpenApiSpec>((resolve, reject) =>
      convertObj(spec, { patch: true, warnOnly: true }, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res.openapi);
      }),
    );
  }
}
