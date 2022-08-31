import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = ({ request, params }) => {
	const dummyItems = [
		{
			owner: `owner 1`,
			ipfsHash: `QmNgwaoKpPYcP2aoWPcki8LhJQqW28VQ4kPvVxjMRMtbKN`,
			price: `9000`,
			id: `identifierHash` // separate from ipfs hash meaning two items could point to the same ipfsHash data
		},
		{
			owner: `owner 1`,
			ipfsHash: `QmNgwaoKpPYcP2aoWPcki8LhJQqW28VQ4kPvVxjMRMtbKN`,
			price: `9001`,
			id: `identifierHash` // separate from ipfs hash meaning two items could point to the same ipfsHash data
		},
		{
			owner: `owner 1`,
			ipfsHash: `QmNgwaoKpPYcP2aoWPcki8LhJQqW28VQ4kPvVxjMRMtbKN`,
			price: `9002`,
			id: `identifierHash` // separate from ipfs hash meaning two items could point to the same ipfsHash data
		},
	]
  return Promise.resolve(dummyItems);
};

// export const onPost: RequestHandler = async ({ request, response }) => {
// 	// could
//   response.headers.set('Content-Type', 'text/plain');
//   return `HTTP Method: ${request.method}`;
// };
