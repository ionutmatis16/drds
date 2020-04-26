const ipfsClient = require('ipfs-http-client');
export const ipfs = ipfsClient('http://localhost:5001');

export const ipfsPath = "http://localhost:8080/ipfs/";

export async function getPartialData(ipfsHash, maxChars) {
    const chunks = [];
    for await (const chunk of ipfs.cat(ipfsHash)) {
        chunks.push(chunk)
    }

    let result = Buffer.concat(chunks).toString();
    if (maxChars < result.length) {
        result = result.substring(0, maxChars) + "...";
    }

    return result;
}
