import { Crypto } from './utils';

export async function jwt(ctx: any, next: Function) {
  const token = ctx.headers.authorization;
  if (token == null) {
    ctx.state.authorized = false;
    return await next();
  }

  try {
    const parsedToken = await Crypto.verifyJWT(token);
    ctx.state.authorized = true;
    ctx.state.jwtToken = parsedToken;
  } catch (e) {
    ctx.throw(401, e.message);
  }

  await next();
}
