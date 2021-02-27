export default () => {
  return {
    "keyUrl": "/auth/realms/RealmName/protocol/openid-connect/certs",
    "config": {
      "algorithms": ["RS256"],
      "issuer": "/auth/realms/RealmName",
      "audience": "account"
    }
  };
}