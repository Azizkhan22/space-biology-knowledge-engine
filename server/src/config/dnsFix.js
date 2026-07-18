// MongoDB Atlas `mongodb+srv://` URIs require a DNS SRV lookup to connect.
// On some machines Node's resolver ends up pointed only at a loopback address
// (e.g. 127.0.0.1, left behind by a VPN/Docker/dev DNS proxy that is no longer
// running) with nothing listening there. The SRV lookup then fails with
// `querySrv ECONNREFUSED`, even though `nslookup` still works via the router.
//
// When we detect a loopback-only resolver, fall back to public DNS servers so
// the Atlas SRV lookup succeeds. This can be overridden with the DNS_SERVERS
// env var (comma-separated list), or disabled by setting it to "off".
const dns = require('dns');

try {
  const override = (process.env.DNS_SERVERS || '').trim();

  if (override.toLowerCase() !== 'off') {
    const servers = dns.getServers();
    const loopbackOnly =
      servers.length === 0 ||
      servers.every((s) => s.startsWith('127.') || s === '::1');

    if (override) {
      dns.setServers(override.split(',').map((s) => s.trim()).filter(Boolean));
      console.log(`🔧 [DNS] Using configured DNS servers: ${dns.getServers().join(', ')}`);
    } else if (loopbackOnly) {
      dns.setServers(['8.8.8.8', '1.1.1.1', ...servers]);
      console.log('🔧 [DNS] Local resolver unavailable — using public DNS (8.8.8.8, 1.1.1.1) for Atlas SRV lookups');
    }
  }

  // Prefer IPv4 for outbound connections. On networks with slow/broken IPv6,
  // Node's default IPv6-first ordering makes fetch/HTTP connects stall (and can
  // exceed undici's 10s connect timeout — e.g. Hugging Face inference calls).
  // IPv6 still works as a fallback; this only changes the ordering.
  if ((process.env.DNS_IPV4_FIRST || '').toLowerCase() !== 'off') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (err) {
  console.warn('⚠️ [DNS] Could not adjust DNS servers:', err.message);
}

module.exports = {};
