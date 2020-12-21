const installCmd = require('./install.cmd').toCommand();
const { Runner } = require('../../../../binary');
const yargs = require('yargs');

jest.mock('../hybrid/helper', () => ({
    downloadProvider: async () => {},
}));

jest.mock('../../../../binary');

describe('install gitops', () => {
    beforeEach(async () => {
        Runner.mockClear();
    });

    it('install gitops argocd-agent w/o arguments', async () => {
        const argv = { provider: 'argocd-agent' };
        await installCmd.handler(argv);
        const { calls } = Runner.mock.instances[0].run.mock;
        expect(calls).toHaveLength(1);
        const [component, commands] = calls[0];
        expect(component.name).toEqual('gitops');
        expect(commands).toEqual(['install']);
    });

    it('install gitops argocd-agent with arguments', async () => {
        const argv = {
            provider: 'argocd-agent',
            'git-integration': 'gitIntegration',
            'codefresh-integration': 'codefreshIntegration',
            'kube-context-name': 'kubeContextName',
            'kube-namespace': 'kubeNamespace',
            'sync-mode': 'SELECT',
            'sync-apps': 'syncApps',
        };
        await installCmd.handler(argv);
        const { calls } = Runner.mock.instances[0].run.mock;
        expect(calls).toHaveLength(1);
        const [component, commands] = calls[0];
        expect(component.name).toEqual('gitops');
        expect(commands).toEqual([
            'install',
            '--git-integration',
            'gitIntegration',
            '--codefresh-integration',
            'codefreshIntegration',
            '--kube-context-name',
            'kubeContextName',
            '--kube-namespace',
            'kubeNamespace',
            '--sync-mode',
            'SELECT',
            '--sync-apps',
            'syncApps',
        ]);
    });

    it('install gitops codefresh with required arguments', async () => {
        const argv = {
            provider: 'codefresh',
            'set-argo-password': 'pass',
            setArgoPassword: 'pass',
            'kube-namespace': 'ns',
            kubeNamespace: 'ns',
        };
        await installCmd.handler(argv);
        const { calls } = Runner.mock.instances[0].run.mock;
        expect(calls).toHaveLength(1);
        const [component, commands] = calls[0];
        expect(component.name).toEqual('cf-gitops-controller');
        expect(commands).toEqual([
            'install',
            '--kube-namespace',
            'ns',
        ]);
    });
});
