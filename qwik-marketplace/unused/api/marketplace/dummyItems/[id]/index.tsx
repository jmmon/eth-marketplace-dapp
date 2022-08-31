import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler<IItem | null> = ({ request, params }) => {

	const dummyItems = [
		{
			owner: `owner 1`,
			// ipfsHash: `QmbJWAESqCsf4RFCqEY7jecCashj8usXiyDNfKtZCwwzGb`,
			ipfsHash: 'QmNgwaoKpPYcP2aoWPcki8LhJQqW28VQ4kPvVxjMRMtbKN',
			price: `9000`,
			id: `1` // separate from ipfs hash meaning two items could point to the same ipfsHash data
		},
		{
			owner: `owner 1`,
			ipfsHash: `QmNgwaoKpPYcP2aoWPcki8LhJQqW28VQ4kPvVxjMRMtbKN`,
			price: `9001`,
			id: `2` // separate from ipfs hash meaning two items could point to the same ipfsHash data
		},
		{
			owner: `owner 1`,
			ipfsHash: `QmNgwaoKpPYcP2aoWPcki8LhJQqW28VQ4kPvVxjMRMtbKN`,
			price: `9002`,
			id: `3` // separate from ipfs hash meaning two items could point to the same ipfsHash data
		},
	];
	// console.log('api onGet [id]:', dummyItems)
	//for testing we filter our dummy items. In production we will fetch the specific item from the blockchain store
	const item = dummyItems.filter(item => item.id === params.id);
	// console.log('found item:', item)
	if (item.length === 0) return null;
  return item[0];
};