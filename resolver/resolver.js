const { Packet, UDPClient } = require('dns2');

const hybridResolve = async (request) => {
    const response = Packet.createResponseFromRequest(request);
    const [ question ] = request.questions;
    const { name } = question;
    if (name.split('.').at(-1) == 'hkust') {
      response.answers.push({
        name,
        type: Packet.TYPE.A,
        class: Packet.CLASS.IN,
        ttl: 300,
        address: '8.8.8.8'
      });
    } else {
      try {
        const publicClient = UDPClient();
        const publicResponse = await publicClient(name);
        const publicAnswers = publicResponse['answers'];
        for (let i = 0; i < publicAnswers.length; ++i) {
          response.answers.push(publicAnswers[i]);
        }
      } catch (error) {
        console.log(error);
      }
    }
    return response;
}

module.exports = hybridResolve;