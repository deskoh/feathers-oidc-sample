import { Params } from '@feathersjs/feathers';
import { OAuthProfile } from '@feathersjs/authentication-oauth';

import Verifier from './Verifier';

const { OAuthStrategy } = require('@feathersjs/authentication-oauth');

interface CognitoProfile {
  sub: string;
  email_verified?: boolean;
  name?: string;
  phone_number_verified?: boolean;
  phone_number?: string;
  email?: string;
  username?: string;
  // added by getProfile
  group?: string;
}

export default class CognitoStrategy extends OAuthStrategy {
  private verifier: Verifier;

  constructor(userPoolId: string, region = 'ap-southeast-1') {
    super();
    this.verifier = new Verifier(userPoolId, region);
  }

  async getProfile (data: any, params: Params) {
    const baseProfile = await super.getProfile(data, params);

    if (!this.verifier.verifyIdToken(data.id_token.header, data.raw.id_token)) {
      throw new Error('ID token signature invalid.');
    }

    // Gets the only first group if it exists
    return {
      group: data.id_token.payload['cognito:groups']?.[0],
      ...baseProfile,
    };
  }

  // Uncomment following code to allow dedup local and cognito login.
  // async getEntityQuery (profile: OAuthProfile, _params: Params) {
  //   return { email: profile.email };
  // }

  async getEntityData(profile: CognitoProfile) {
    const baseData = await super.getEntityData(profile);

    return {
      name: profile.name,
      phone: profile.phone_number,
      username: profile.username,
      email: profile.email,
      group: profile.group,
      ...baseData,
    };
  }
}
