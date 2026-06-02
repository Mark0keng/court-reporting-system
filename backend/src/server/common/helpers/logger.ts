export function log(tags: string[], data: { trxId: string, info: string }) {
  const timestamp = new Date().toISOString();
  const tagString = tags.join(' > ');
  const trxId = data.trxId || 'SYSTEM';
  const message = data.info || '';

  if (tags.includes('ERROR')) {
    console.error(`[${timestamp}] [${trxId}] [${tagString}]: ${message}`);
  } else if (tags.includes('WARNING')) {
    console.warn(`[${timestamp}] [${trxId}] [${tagString}]: ${message}`);
  } else {
    console.log(`[${timestamp}] [${trxId}] [${tagString}]: ${message}`);
  }
}
