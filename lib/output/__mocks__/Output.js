
const Output = jest.genMockFromModule('../Output');

Output.printError = (e) => {
    throw e;
};

module.exports = Output;
