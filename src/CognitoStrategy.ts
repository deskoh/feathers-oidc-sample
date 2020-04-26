import { Params } from '@feathersjs/feathers';

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

class CognitoStrategy extends OAuthStrategy {

  async getProfile (data: any, params: Params) {
    const baseProfile = await super.getProfile(data, params);

    // Gets the only first group if it exists
    return {
      group: data.id_token.payload['cognito:groups']?.[0],
      ...baseProfile,
    };
  }

  async getEntityData(profile: CognitoProfile) {
    const baseData = await super.getEntityData(profile);

    console.log(profile);

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

export default CognitoStrategy;
