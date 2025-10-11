// src/utils/getGeoInfo.ts
import geoip from 'geoip-lite';

export function getGeoInfo(ip: string | undefined): {
  ip: string;
  country: string;
  city: string;
  locale: string;
} {
  const resolvedIp = ip ?? 'unknown';
  const geo = geoip.lookup(resolvedIp) || {};
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;

  return {
    ip: resolvedIp,
    country: geo.country || 'Unknown',
    city: geo.city || 'Unknown',
    locale,
  };
}
