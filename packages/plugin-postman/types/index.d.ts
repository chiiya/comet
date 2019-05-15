export interface PostmanCollection {
  info: PostmanInformation;
  item: (PostmanItem | PostmanFolder)[];
  event?: PostmanEvent[];
  variable?: PostmanVariable[];
  auth?: PostmanAuth;
  protocolProfileBehavior?: object;
}

export interface PostmanInformation {
  name: string;
  _postman_id?: string;
  description?: string | PostmanDescription;
  version?: string | PostmanVersion;
  schema: string;
}

export interface PostmanDescription {
  content?: string;
  type?: string;
  version?: string;
}

export interface PostmanVersion {
  major: number;
  minor: number;
  patch: number;
  identifier?: string;
  meta?: any;
}

export interface PostmanItem {
  id?: string;
  name?: string;
  description?: string | PostmanDescription;
  variable?: PostmanVariable[];
  event?: PostmanEvent[];
  request: string | PostmanRequest;
  response?: PostmanResponse[];
  protocolProfileBehavior?: object;
}

export interface PostmanFolder {
  name?: string;
  description?: string | PostmanDescription;
  variable?: PostmanVariable[];
  item?: (PostmanItem | PostmanFolder)[];
  event?: PostmanEvent[];
  auth?: PostmanAuth;
  protocolProfileBehavior?: object;
}

export interface PostmanVariable {
  id: string;
  key: string;
  value?: any;
  type?: 'string' | 'boolean' | 'number' | 'any';
  name?: string;
  description?: string | PostmanDescription;
  system?: boolean;
  disabled?: boolean;
}

export interface PostmanEvent {
  id?: string;
  listen: string;
  script?: PostmanScript;
  disabled?: boolean;
}

export interface PostmanRequest {
  url?: PostmanUrl;
  auth?: PostmanAuth;
  proxy?: PostmanProxy;
  certificate?: PostmanCertificate;
  method?: string;
  description?: string | PostmanDescription;
  header?: string | PostmanHeader[];
  body?: PostmanBody | null;
}

export interface PostmanResponse {
  id?: string;
  originalRequest?: PostmanRequest;
  responseTime: string | number | null;
  timings?: any;
  header?: string[] | PostmanHeader[] | string | null;
  cookie?: PostmanCookie[];
  body?: string;
  status?: string;
  code?: number;
}

export interface PostmanHeader {
  key: string;
  value: string;
  disabled?: boolean;
  description?: string | PostmanDescription;
}

export interface PostmanCookie {
  domain: string;
  expires?: string;
  maxAge?: string;
  hostOnly?: boolean;
  httpOnly?: boolean;
  name?: string;
  path: string;
  secure?: boolean;
  session?: boolean;
  value?: string;
  extensions?: any[];
}

export interface PostmanBody {
  mode?: 'raw' | 'urlencoded' | 'formdata' | 'file' | 'graphql';
  raw?: string;
  graphql?: any;
  urlencoded?: PostmanUrlParameter[];
  formdata?: PostmanFormParameter[];
  file?: PostmanFile;
  disabled?: boolean;
}

export interface PostmanUrlParameter {
  key: string;
  value?: string;
  disabled?: boolean;
  description: string | PostmanDescription;
}

export interface PostmanFormParameter {
  key: string;
  type?: 'file';
  value?: string;
  src?: string | any[];
  disabled?: boolean;
  contentType?: string;
  description?: string | PostmanDescription;
}

export interface PostmanFile {
  src?: string | null;
  content?: string;
}

export interface PostmanScript {
  id?: string;
  type?: string;
  exec?: string | string[];
  src?: string | PostmanUrl;
  name?: string;
}

export interface PostmanUrl {
  raw?: string;
  protocol?: string;
  host?: string | string[];
  path?: string | string[];
  port?: string;
  query?: PostmanQueryParam[];
  hash?: string;
  variable?: PostmanVariable[];
}

export interface PostmanQueryParam {
  key?: string;
  value?: string;
  disabled?: boolean;
  description?: string | PostmanDescription;
}

export type PostmanAuthType = 'apikey'
  | 'awsv4'
  | 'basic'
  | 'bearer'
  | 'digest'
  | 'hawk'
  | 'noauth'
  | 'oauth1'
  | 'oauth2'
  | 'ntlm';

export interface PostmanAuth {
  type: PostmanAuthType;
  noauth?: any;
  apikey?: PostmanAuthAttribute[];
  basic?: PostmanAuthAttribute[];
  bearer?: PostmanAuthAttribute[];
  digest?: PostmanAuthAttribute[];
  hawk?: PostmanAuthAttribute[];
  oauth1?: PostmanAuthAttribute[];
  oauth2?: PostmanAuthAttribute[];
  ntlm?: PostmanAuthAttribute[];
}

export interface PostmanAuthAttribute {
  key: string;
  value?: any;
  type: string;
}

export interface PostmanProxy {
  math?: string;
  host?: string;
  port?: number;
  tunnel?: boolean;
  disabled?: boolean;
}

export interface PostmanCertificate {
  name?: string;
  matches?: string[];
  key?: {
    src?: string;
  };
  cert?: {
    src?: string;
  };
  passphrase?: string;
}
