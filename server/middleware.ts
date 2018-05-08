import { Crypto } from './utils';

export async function jwt(ctx: any, next: Function) {
  const token = ctx.headers.authorization;
  if (token == null) {
    ctx.state.authenticated = false;
    return await next();
  }

  try {
    const parsedToken = await Crypto.verifyJWT(token);
    ctx.state.authenticated = true;
    ctx.state.jwtToken = parsedToken;
  } catch (e) {
    ctx.state.authenticated = false;
    ctx.state.jwtError = e.message;
  }

  await next();
}
