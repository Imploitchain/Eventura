// TODO: IPFS upload utility (not implemented yet)
export async function uploadToIPFS(_data: any): Promise<string> {
  throw new Error('uploadToIPFS not implemented')
}

function resolveIpfsUri(uri: string): string {
  // If http(s), return as-is
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri
  // If ipfs://<cid>/path -> use configured gateway
  const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
  if (uri.startsWith('ipfs://')) {
    const path = uri.replace('ipfs://', '')
    return gateway.endsWith('/') ? `${gateway}${path}` : `${gateway}/${path}`
  }
  // Assume raw CID
  return gateway.endsWith('/') ? `${gateway}${uri}` : `${gateway}/${uri}`
}

export async function fetchFromIPFS(uriOrCid: string): Promise<any> {
  const url = resolveIpfsUri(uriOrCid)
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`IPFS fetch failed: ${res.status}`)
  return res.json()
}
