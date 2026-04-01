const parseCookies = (cookieHeader = '') => {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) {
        return acc;
      }

      const key = decodeURIComponent(part.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
};

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret === 'secret') {
    throw new Error('JWT_SECRET must be configured and must not use the default insecure value.');
  }

  return secret;
};

export const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookies = parseCookies(req.headers.cookie);
  return cookies.token;
};

export const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = 24 * 60 * 60;

  res.setHeader('Set-Cookie', [
    [
      `token=${encodeURIComponent(token)}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${maxAge}`,
      isProduction ? 'Secure' : null
    ]
      .filter(Boolean)
      .join('; ')
  ]);
};

export const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.setHeader('Set-Cookie', [
    [
      'token=',
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=0',
      isProduction ? 'Secure' : null
    ]
      .filter(Boolean)
      .join('; ')
  ]);
};
