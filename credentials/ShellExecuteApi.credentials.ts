import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class ShellExecuteApi implements ICredentialType {
	name = 'shellExecuteApi';
	displayName = 'Shell Execute API';
	properties: INodeProperties[] = [
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: '인증 토큰 (환경변수 TOKEN 으로 주입됨)',
		},
	];
}
