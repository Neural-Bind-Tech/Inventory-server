import { type Request } from 'express';
import { UAParser } from 'ua-parser-js';

interface IResponse {
  ip: string;
  device: {
    browser: string;
    device: string;
    os: string;
  };
  endpoint: string | null;
  method: string | null;
}

export const getDeviceInfo = (req: Request): IResponse => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedForValue = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor;
  const firstForwardedIp = forwardedForValue?.split(',')?.[0]?.trim();
  const clientIp = firstForwardedIp || req.socket.remoteAddress || 'Unknown';

  const userAgent = req.headers['user-agent'] || 'Unknown';
  const parser = new UAParser(userAgent);
  const deviceInfo = {
    browser: parser.getBrowser().name || 'Unknown Browser',
    device: parser.getDevice().type || 'desktop',
    os: parser.getOS().name || 'Unknown OS',
  };
  const endpoint = req.originalUrl || null;
  const method = req.method || null;

  return {
    ip: clientIp,
    device: deviceInfo,
    endpoint,
    method,
  };
};
