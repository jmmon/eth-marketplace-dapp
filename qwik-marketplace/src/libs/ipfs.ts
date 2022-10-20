
import { IPFS_POST_URL } from "~/libs/constants";
import {create} from "ipfs-http-client";


export const IPFS_FETCH_URL = 'http://localhost:8080/ipfs/';
// export const IPFS_FETCH_URL = 'https://ipfs.io/ipfs/';

export const ipfsOptions = {
	url: "http://127.0.0.1:5001",
};

export const ipfsClient = create(ipfsOptions);