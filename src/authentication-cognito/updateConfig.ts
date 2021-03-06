export default (config: any) => {
  if (!config.base_url) throw new Error('base_url not configured for Cognito');

  config.authorize_url = `${config.base_url}/authorize`;
  config.access_url = `${config.base_url}/token`;
  config.profile_url = `${config.base_url}/userInfo`;

  return config;
};
