const DRDS = artifacts.require("DRDS");

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('DRDS', (accounts) => {
    // accounts => provided by the blockchain
    let drds;

    before(async () => {
        drds = await DRDS.deployed();
    });

    // describe provides a way to organize tests examples, the first arg is the name of the test
    describe('deployment', async () => {
        // the contract was deployed correctly & was deployed correct
        it('deploys successfully', async () => {
            const address = drds.address;
            validAddress(address);
        })
    });

    //TODO should I add another test to check the file hash?
    describe('storage', async () => {
        it('updates the fileHash correctly', async () => {
            const fileHash = "fileHash";
            const fileName = "fileName";
            await drds.addFileHash(fileName, fileHash, "Test username");
            const author = await drds.getAuthor(fileHash);
            validAddress(author.addr);
        });
    });

    describe('duplicate file', async () => {
        it("should throw an error", async () => {
            const fileHash = "fileHash2";
            const fileName = "fileName";
            await drds.addFileHash(fileName, fileHash, "Test username");
            try {
                // try to add the same hash again
                await drds.addFileHash(fileName, fileHash, "Test username");
            } catch (err) {
                console.log(err.reason);
                return;
            }
            assert(false, 'Expected throw not received');
        });
    });
});

function validAddress(address) {
    assert.notEqual(address, 0x0);
    assert.notEqual(address, '');
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
}