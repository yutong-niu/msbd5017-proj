const { Packet, UDPClient } = require('dns2');
const distribQuery = require('./query')

const hybridResolve = async (request) => {
    const response = Packet.createResponseFromRequest(request);
    const [ question ] = request.questions;
    const { name } = question;
    if (name.split('.').at(-1) == 'hkust') {
        answer = await distribQuery(name);
        response.answers.push(answer);
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