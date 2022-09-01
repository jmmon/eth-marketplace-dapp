import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler<IItem[]> = ({ request, params }) => {
	const dummyItems = [
		{
			owner: `address123`,
			ipfsHash: `QmNgwaoKpPYcP2aoWPcki8LhJQqW28VQ4kPvVxjMRMtbKN`,
			price: `9000`,
			id: `1` // separate from ipfs hash meaning two items could point to the same ipfsHash data
		},
		{
			owner: `address234`,
			ipfsHash: `QmNgwaoKpPYcP2aoWPcki8LhJQqW28VQ4kPvVxjMRMtbKN`,
			price: `9001`,
			id: `2`
		},
		{
			owner: `address345`,
			ipfsHash: `QmNgwaoKpPYcP2aoWPcki8LhJQqW28VQ4kPvVxjMRMtbKN`,
			price: `9002`,
			id: `3`
		},
	]
	// console.log('get marketplace/dummyItems');
  return Promise.resolve(dummyItems);
};

// export const onPost: RequestHandler = async ({ request, response }) => {
// 	// could
//   response.headers.set('Content-Type', 'text/plain');
//   return `HTTP Method: ${request.method}`;
// };
