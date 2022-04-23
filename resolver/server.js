const dns2 = require('dns2');
const hybridResolve = require('./resolver')

const server = dns2.createServer({
  udp: true,
  handle: async (request, send, rinfo) => {
    try {
      const response = await hybridResolve(request); 
      send(response)
    } catch (error) {
      server.emit('requestError', error);
    }
  }
});

server.on('request', (request, response, rinfo) => {
  console.log(request.header.id, request.questions[0]);
});

server.on('requestError', (error) => {
  console.log('Client sent an invalid request', error);
});

server.on('listening', () => {
  console.log(server.addresses());
});

server.on('close', () => {
    console.log('server closed.');
});

(async() => {
    const closed = new Promise(resolve => process.on('SIGINT', resolve));
    await server.listen({
        udp: { 
            port: 53,
            address: "127.0.0.1",
            type: "udp4",  // IPv4 or IPv6 (Must be either "udp4" or "udp6")
        },
    }),
    console.log('Listening.');
    await closed;
    process.stdout.write('\n');
    await server.close();
})();