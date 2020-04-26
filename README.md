# FeathersJS OIDC Sample

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

Authentication is integrated with AWS Cognito.

## Configuration

Cogito metadata endpoint:

```
https://cognito-idp.<aws-region>.amazonaws.com/<user-pool-id>/.well-known/openid-configuration
```

Cognito Configuration Parameters: `config/default.json`

`authorize_url`:

```
https://cognito-idp.<aws-region>.amazonaws.com/<user-pool-id>/authorize
https://<domain-prefix>.<aws-region>.amazoncognito.com/oauth2/authorize
```

`access_url`:

```
https://cognito-idp.<aws-region>.amazonaws.com/<user-pool-id>/token
https://<domain-prefix>.<aws-region>.amazoncognito.com/oauth2/token
```

`profile_url`:

```
https://cognito-idp.<aws-region>.amazonaws.com/<user-pool-id>/userInfo
https://<domain-prefix>.<aws-region>.amazoncognito.com/oauth2/userInfo
```

Login URL: `http://localhost:3030/oauth/cognito`
