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

export async function getValidatedFile(fileHash, dataToCopy) {
    let isValid = undefined;
    let linkResult = [];
    let totalSize = 0;
    try {
        let nodeData = await ipfs.object.get(fileHash);
        isValid = true;
        totalSize = nodeData.size;

        let links = [];
        nodeData._links.forEach(link => links.push({size: link.Tsize, hash: link.Hash.string}));
        for (let j = 0; j < links.length; j++) {
            let linkIsValid = undefined;
            let partialDataToDisplay = '';
            try {
                partialDataToDisplay = await getPartialData(links[j].hash, 2000);
                linkIsValid = true;
            } catch (e) {
                if (e.message.includes("block in storage has different hash than requested")) {
                    linkIsValid = false;
                    isValid = false;
                    partialDataToDisplay = "INVALID FILE";
                }
            }

            let updatedLink = {
                ...links[j],
                linkIsValid: linkIsValid,
                partialDataToDisplay: partialDataToDisplay
            };

            linkResult.push(updatedLink);
        }
    } catch (e) {
        if (e.message.includes("block in storage has different hash than requested")) {
            isValid = false;
        } else if (e.message === "Failed to fetch") {
            alert("You are not connected to an IPFS node!");
        } else {
            console.log(e);
        }
    }

    let partialData = "INVALID FILE";
    if (isValid) {
        partialData = await getPartialData(fileHash, 2000);
    }

    return {
        ...dataToCopy,
        totalSize: totalSize,
        isValid: isValid,
        links: linkResult,
        partialDataToDisplay: partialData
    };
}