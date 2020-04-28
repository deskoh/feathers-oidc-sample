import {promisify} from 'util';
import * as Axios from 'axios';
import * as jsonwebtoken from 'jsonwebtoken';
const jwkToPem = require('jwk-to-pem');

export interface ClaimVerifyRequest {
  readonly token?: string;
}

interface TokenHeader {
  kid: string;
  alg: string;
}
interface PublicKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}
interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

interface PublicKeys {
  keys: PublicKey[];
}

interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

interface Claim {
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  username: string;
  client_id: string;
}

const verifyPromised = promisify(jsonwebtoken.verify.bind(jsonwebtoken));

export default class Verifier {
  private cognitoIssuer: string;
  private cacheKeys: MapOfKidToPublicKey | undefined;

  constructor(userPoolId: string, region: string) {
    this.cognitoIssuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
  }

  public verifyAccessToken = (header: TokenHeader, token: string) => this.verify(header, token, 'access');

  public verifyIdToken = (header: TokenHeader, token: string) => this.verify(header, token, 'id');

  private getPublicKeys = async (): Promise<MapOfKidToPublicKey> => {
    if (!this.cacheKeys) {
      const url = `${this.cognitoIssuer}/.well-known/jwks.json`;
      const publicKeys = await Axios.default.get<PublicKeys>(url);
      this.cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
        const pem = jwkToPem(current);
        agg[current.kid] = {instance: current, pem};
        return agg;
      }, {} as MapOfKidToPublicKey);
      return this.cacheKeys;
    } else {
      return this.cacheKeys;
    }
  };

  private verify = async (header: TokenHeader, token: string, tokenUse: 'id' | 'access'): Promise<boolean> => {
    try {
      const keys = await this.getPublicKeys();
      const key = keys[header.kid];
      if (key === undefined) {
        throw new Error('claim made for unknown kid');
      }
      const claim = await verifyPromised(token, key.pem) as Claim;
      const currentSeconds = Math.floor( (new Date()).valueOf() / 1000);
      if (currentSeconds > claim.exp || Math.abs(currentSeconds - claim.auth_time) > 1) {
        throw new Error('claim is expired or invalid');
      }
      if (claim.iss !== this.cognitoIssuer) {
        throw new Error('claim issuer is invalid');
      }
      if (claim.token_use !== tokenUse) {
        throw new Error(`claim use is not ${tokenUse}`);
      }
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  };
};
