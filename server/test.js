const dns = require("dns").promises;

(async () => {
  try {
    const result = await dns.resolveSrv(
      "_mongodb._tcp.courseup.9edq0ii.mongodb.net"
    );
    console.log(result);
  } catch (err) {
    console.error(err);
  }
})();