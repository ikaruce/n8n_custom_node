import { exec } from 'child_process';
import { promisify } from 'util';

import {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	IExecuteFunctions,
	INodeCredentialTestResult,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

const execAsync = promisify(exec);

export class ShellExecute implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Shell Execute',
		name: 'shellExecute',
		icon: 'file:shell.svg',
		group: ['transform'],
		version: 1,
		description: '쉘 명령어를 실행하고 TOKEN, BASE_URL, VERSION 을 환경변수로 주입합니다',
		defaults: {
			name: 'Shell Execute',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'shellExecuteApi',
				required: true,
				testedBy: 'testCredentials',
			},
		],
		properties: [
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'http://localhost:5678',
				required: true,
				description: '환경변수 BASE_URL 로 주입될 값',
			},
			{
				displayName: 'Version',
				name: 'version',
				type: 'string',
				default: 'v1',
				required: true,
				description: '환경변수 VERSION 으로 주입될 값',
			},
			{
				displayName: 'Command',
				name: 'command',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				required: true,
				placeholder: 'echo "Hello from n8n"',
				description: '실행할 쉘 명령어. TOKEN, BASE_URL, VERSION 환경변수를 사용할 수 있습니다.',
			},
			{
				displayName: 'Working Directory',
				name: 'workingDirectory',
				type: 'string',
				default: '',
				placeholder: '/home/user/scripts',
				description: '명령을 실행할 디렉토리. 비워두면 n8n 기본 경로를 사용합니다.',
			},
			{
				displayName: 'Timeout (ms)',
				name: 'timeout',
				type: 'number',
				default: 60000,
				description: '명령어 최대 실행 시간 (밀리초). 기본값: 60000 (60초)',
			},
		],
	};

	async credentialTest(
		this: ICredentialTestFunctions,
		credential: ICredentialsDecrypted,
	): Promise<INodeCredentialTestResult> {
		const { token } = credential.data as { token: string };
		if (!token || token.trim() === '') {
			return { status: 'Error', message: 'Token 이 비어있습니다.' };
		}
		return { status: 'OK', message: '토큰이 설정되었습니다.' };
	}

	methods = {
		credentialTest: {
			testCredentials: this.credentialTest,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('shellExecuteApi');
		const token = credentials.token as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const command = this.getNodeParameter('command', i) as string;
				const baseUrl = this.getNodeParameter('baseUrl', i) as string;
				const version = this.getNodeParameter('version', i) as string;
				const workingDirectory = this.getNodeParameter('workingDirectory', i) as string;
				const timeout = this.getNodeParameter('timeout', i) as number;

				const env: NodeJS.ProcessEnv = {
					...process.env,
					TOKEN: token,
					BASE_URL: baseUrl,
					VERSION: version,
				};

				const execOptions = {
					env,
					timeout,
					...(workingDirectory ? { cwd: workingDirectory } : {}),
				};

				const { stdout, stderr } = await execAsync(command, execOptions);

				returnData.push({
					json: {
						stdout: stdout.trim(),
						stderr: stderr.trim(),
						exitCode: 0,
					},
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					const execError = error as {
						stdout?: string;
						stderr?: string;
						code?: number;
						message?: string;
					};
					returnData.push({
						json: {
							stdout: execError.stdout?.trim() ?? '',
							stderr: execError.stderr?.trim() ?? execError.message ?? String(error),
							exitCode: execError.code ?? 1,
							error: true,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
