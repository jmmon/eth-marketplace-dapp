
import {create} from "ipfs-http-client";

// gateway URL from the local IPFS daemon, or can connect to https://ipfs.io/ipfs/
export const IPFS_FETCH_URL = 'http://localhost:8080/ipfs/';
// export const IPFS_FETCH_URL = 'https://ipfs.io/ipfs/';

// option for the Qwik IPFS client, which connects to our local go-ipfs daemon
export const ipfsOptions = {
	url: "http://127.0.0.1:5001",
};

export const ipfsClient = create(ipfsOptions);