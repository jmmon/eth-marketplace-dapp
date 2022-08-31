import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = ({ request, params }) => {

	const dummyItems = [
		{
			owner: `owner 1`,
			ipfsHash: `QmbJWAESqCsf4RFCqEY7jecCashj8usXiyDNfKtZCwwzGb`,
			price: `9000`,
			id: `identifierHash` // separate from ipfs hash meaning two items could point to the same ipfsHash data
		},
		{
			owner: `owner 1`,
			ipfsHash: `QmbJWAESqCsf4RFCqEY7jecCashj8usXiyDNfKtZCwwzGb`,
			price: `9001`,
			id: `identifierHash` // separate from ipfs hash meaning two items could point to the same ipfsHash data
		},
		{
			owner: `owner 1`,
			ipfsHash: `QmbJWAESqCsf4RFCqEY7jecCashj8usXiyDNfKtZCwwzGb`,
			price: `9002`,
			id: `identifierHash` // separate from ipfs hash meaning two items could point to the same ipfsHash data
		},
	];
	if (params.id > dummyItems.length - 1) return null;
  return dummyItems[params.id];
};