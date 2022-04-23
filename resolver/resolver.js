const dns2 = require('dns2');

const { Packet } = dns2;

const server = dns2.createServer({
  udp: true,
  handle: (request, send, rinfo) => {
    const response = Packet.createResponseFromRequest(request);
    const [ question ] = request.questions;
    const { name } = question;
    response.answers.push({
      name,
      type: Packet.TYPE.A,
      class: Packet.CLASS.IN,
      ttl: 300,
      address: '8.8.8.8'
    });
    send(response);
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