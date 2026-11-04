const CFError = require('cf-errors');
const DEFAULTS = require('../../defaults');

jest.mock('../../../../logic', () => ({
    sdk: { workflows: { waitForStatus: jest.fn() } },
}));

const { sdk } = require('../../../../logic');
const Output = require('../../../../output/Output');
let waitCmd = require('./wait.cmd');

waitCmd.requiresAuthentication = false;
waitCmd = waitCmd.toCommand();

const BUILD_ID = '5b5f6b8f4c4c7a0001a0b0c0';

describe('wait command', () => {
    let exitSpy;
    let originalPrintError;

    beforeEach(() => {
        sdk.workflows.waitForStatus.mockReset();
        exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
        // the global Output mock rethrows errors, but here we need to reach process.exit
        originalPrintError = Output.printError;
        Output.printError = jest.fn();
    });

    afterEach(() => {
        exitSpy.mockRestore();
        Output.printError = originalPrintError;
    });

    it('should not exit with error when the desired status is reached', async () => {
        sdk.workflows.waitForStatus.mockResolvedValue({ status: 'success' });

        await waitCmd.handler({ id: [BUILD_ID], status: 'success', timeout: 1 });

        expect(sdk.workflows.waitForStatus).toHaveBeenCalledWith(BUILD_ID, 'success', expect.anything(), undefined);
        expect(exitSpy).not.toHaveBeenCalled();
    });

    it(`should exit with code ${DEFAULTS.TIMEOUT_EXIT_CODE} on timeout`, async () => {
        sdk.workflows.waitForStatus.mockRejectedValue(new CFError({ message: 'Operation has timed out', isTimeout: true }));

        await waitCmd.handler({ id: [BUILD_ID], status: 'success', timeout: 1 });

        expect(exitSpy).toHaveBeenCalledWith(DEFAULTS.TIMEOUT_EXIT_CODE);
    });

    it('should exit with code 1 on API error', async () => {
        sdk.workflows.waitForStatus.mockRejectedValue(new CFError({ message: '"error code: 520\\n"', statusCode: 520 }));

        await waitCmd.handler({ id: [BUILD_ID], status: 'success', timeout: 1 });

        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should exit with code 1 when the build finished with another status', async () => {
        sdk.workflows.waitForStatus.mockRejectedValue(new CFError(`Build: ${BUILD_ID} finished with status: error`));

        await waitCmd.handler({ id: [BUILD_ID], status: 'success', timeout: 1 });

        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should exit with code 1 on invalid build id', async () => {
        await waitCmd.handler({ id: ['invalid'], status: 'success', timeout: 1 });

        expect(sdk.workflows.waitForStatus).not.toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(1);
    });
});
