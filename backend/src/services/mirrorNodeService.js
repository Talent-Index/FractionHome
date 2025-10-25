async getTokenBalances(tokenId) {
  try {
    const response = await fetch(
      `${this.baseUrl}/api/v1/tokens/${tokenId}/balances`
    );
    const data = await response.json();
    
    return data.balances.map(b => ({
      accountId: b.account,
      balance: b.balance
    }));
  } catch (error) {
    logger.error('Mirror node balance fetch failed:', error);
    throw error;
  }
}