import { ServiceAddons } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth } from '@feathersjs/authentication-oauth';

import { Application } from './declarations';
import { CognitoStrategy, updateConfig } from './authentication-cognito';

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
  }
}

export default function(app: Application) {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  const cognitoConfig = updateConfig(app.get('authentication').oauth.cognito);
  authentication.register('cognito', new CognitoStrategy(cognitoConfig.userPoolId, cognitoConfig.region) as any);

  app.use('/authentication', authentication);

  app.configure(expressOauth());
}
