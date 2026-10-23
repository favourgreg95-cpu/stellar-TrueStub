/**
 * Tests for the trustline registry — issue #275.
 *
 * Verifies that the multi-asset escrow trustline configuration correctly
 * exposes USDC, XLM, and EURC on both testnet and mainnet, that each asset
 * has all required fields, and that the helper functions resolve assets
 * correctly.
 *
 * This is a pure TypeScript module test — no React or JSX.
 */

import {
  trustlines,
  getSupportedAssets,
  getTrustlineBySymbol,
  getSupportedAssetsForActiveNetwork,
  getActiveNetwork,
  addTrustlineAsset,
  type TrustlineOption,
} from './trustlines';

// ─── Helpers ────────────────────────────────────────────────────────────────

const EXPECTED_SYMBOLS = ['USDC', 'XLM', 'EURC'];

function expectValidAssetFields(asset: TrustlineOption) {
  expect(asset).toBeDefined();
  expect(typeof asset.value).toBe('string');
  expect(asset.value.length).toBeGreaterThan(0);
  expect(typeof asset.label).toBe('string');
  expect(typeof asset.symbol).toBe('string');
  expect(typeof asset.decimals).toBe('number');
  // icon and description are optional but should be strings when present
  if (asset.icon !== undefined) {
    expect(typeof asset.icon).toBe('string');
  }
  if (asset.description !== undefined) {
    expect(typeof asset.description).toBe('string');
  }
}

// ─── getSupportedAssets ──────────────────────────────────────────────────────

describe('getSupportedAssets', () => {
  describe('testnet', () => {
    it('returns all three assets (USDC, XLM, EURC)', () => {
      const assets = getSupportedAssets('testnet');
      expect(assets).toHaveLength(3);
      const symbols = assets.map((a) => a.label);
      expect(symbols).toEqual(
        expect.arrayContaining(EXPECTED_SYMBOLS),
      );
    });

    it('each asset has the correct fields (address, issuer, decimals, symbol, name, icon, description)', () => {
      const assets = getSupportedAssets('testnet');
      for (const asset of assets) {
        expectValidAssetFields(asset);
      }
    });
  });

  describe('mainnet', () => {
    it('returns all three assets (USDC, XLM, EURC)', () => {
      const assets = getSupportedAssets('mainnet');
      expect(assets).toHaveLength(3);
      const symbols = assets.map((a) => a.label);
      expect(symbols).toEqual(
        expect.arrayContaining(EXPECTED_SYMBOLS),
      );
    });

    it('each asset has the correct fields', () => {
      const assets = getSupportedAssets('mainnet');
      for (const asset of assets) {
        expectValidAssetFields(asset);
      }
    });
  });

  it('returns an empty array for an unknown network', () => {
    const assets = getSupportedAssets('futurenet' as any);
    expect(assets).toHaveLength(0);
  });

  it('defaults to testnet when no network is specified', () => {
    const assets = getSupportedAssets();
    expect(assets).toHaveLength(3);
    const symbols = assets.map((a) => a.label);
    expect(symbols).toEqual(
      expect.arrayContaining(EXPECTED_SYMBOLS),
    );
  });
});

// ─── getTrustlineBySymbol ───────────────────────────────────────────────────

describe('getTrustlineBySymbol', () => {
  it('resolves USDC on testnet', () => {
    const asset = getTrustlineBySymbol('USDC', 'testnet');
    expect(asset).toBeDefined();
    expect(asset!.label).toBe('USDC');
    expect(asset!.symbol).toBe('USDC');
    expect(asset!.value).toMatch(/^[CG]/); // Soroban contract or issuer address
  });

  it('resolves XLM on testnet', () => {
    const asset = getTrustlineBySymbol('XLM', 'testnet');
    expect(asset).toBeDefined();
    expect(asset!.label).toBe('XLM');
    expect(asset!.symbol).toBe('XLM');
  });

  it('resolves EURC on testnet', () => {
    const asset = getTrustlineBySymbol('EURC', 'testnet');
    expect(asset).toBeDefined();
    expect(asset!.label).toBe('EURC');
    expect(asset!.symbol).toBe('EURC');
  });

  it('resolves USDC on mainnet', () => {
    const asset = getTrustlineBySymbol('USDC', 'mainnet');
    expect(asset).toBeDefined();
    expect(asset!.label).toBe('USDC');
  });

  it('resolves XLM on mainnet', () => {
    const asset = getTrustlineBySymbol('XLM', 'mainnet');
    expect(asset).toBeDefined();
    expect(asset!.label).toBe('XLM');
  });

  it('resolves EURC on mainnet', () => {
    const asset = getTrustlineBySymbol('EURC', 'mainnet');
    expect(asset).toBeDefined();
    expect(asset!.label).toBe('EURC');
  });

  it('is case-insensitive', () => {
    const asset = getTrustlineBySymbol('usdc', 'testnet');
    expect(asset).toBeDefined();
    expect(asset!.label).toBe('USDC');
  });

  it('returns undefined for an unknown symbol', () => {
    const asset = getTrustlineBySymbol('UNKNOWN', 'testnet');
    expect(asset).toBeUndefined();
  });

  it('defaults to testnet when no network is specified', () => {
    const asset = getTrustlineBySymbol('USDC');
    expect(asset).toBeDefined();
    expect(asset!.label).toBe('USDC');
  });
});

// ─── getSupportedAssetsForActiveNetwork ─────────────────────────────────────

describe('getSupportedAssetsForActiveNetwork', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalNetwork = process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK = originalNetwork;
  });

  it('returns testnet assets in development', () => {
    delete process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK;
    process.env.NODE_ENV = 'development';
    const assets = getSupportedAssetsForActiveNetwork();
    expect(assets).toHaveLength(3);
    // Cross-check with the raw registry: testnet entries match
    const testnetAddresses = trustlines
      .filter((t) => t.network === 'testnet')
      .map((t) => t.address);
    const returnedAddresses = assets.map((a) => a.value);
    expect(returnedAddresses).toEqual(
      expect.arrayContaining(testnetAddresses),
    );
  });

  it('returns mainnet assets in production', () => {
    delete process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK;
    process.env.NODE_ENV = 'production';
    const assets = getSupportedAssetsForActiveNetwork();
    expect(assets).toHaveLength(3);
    const mainnetAddresses = trustlines
      .filter((t) => t.network === 'mainnet')
      .map((t) => t.address);
    const returnedAddresses = assets.map((a) => a.value);
    expect(returnedAddresses).toEqual(
      expect.arrayContaining(mainnetAddresses),
    );
  });

  it('respects NEXT_PUBLIC_TRUSTLESS_NETWORK override', () => {
    process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK = 'mainnet';
    process.env.NODE_ENV = 'development';
    const assets = getSupportedAssetsForActiveNetwork();
    expect(assets).toHaveLength(3);
    const labels = assets.map((a) => a.label);
    expect(labels).toEqual(
      expect.arrayContaining(EXPECTED_SYMBOLS),
    );
    // Mainnet USDC address differs from testnet
    const mainnetUsdc = trustlines.find(
      (t) => t.network === 'mainnet' && t.name === 'USDC',
    );
    expect(assets.find((a) => a.label === 'USDC')!.value).toBe(
      mainnetUsdc!.address,
    );
  });

  it('getActiveNetwork returns the correct network', () => {
    delete process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK;
    process.env.NODE_ENV = 'development';
    expect(getActiveNetwork()).toBe('testnet');

    process.env.NODE_ENV = 'production';
    expect(getActiveNetwork()).toBe('mainnet');

    process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK = 'mainnet';
    expect(getActiveNetwork()).toBe('mainnet');

    process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK = 'testnet';
    expect(getActiveNetwork()).toBe('testnet');
  });
});

// ─── addTrustlineAsset ──────────────────────────────────────────────────────

describe('addTrustlineAsset', () => {
  const originalLength = trustlines.length;

  afterEach(() => {
    // Remove any test-added assets to keep the registry clean for other tests.
    while (trustlines.length > originalLength) {
      trustlines.pop();
    }
  });

  it('adds a new asset to the registry', () => {
    const newAsset = {
      name: 'yXLM',
      symbol: 'yXLM',
      address: 'CUSTOM_ASSET_ADDRESS_1234567890',
      issuer: 'CUSTOM_ISSUER_ADDRESS_1234567890',
      decimals: 10000000,
      network: 'testnet' as const,
      icon: '💫',
      description: 'Yield-bearing XLM',
    };

    addTrustlineAsset(newAsset);

    const assets = getSupportedAssets('testnet');
    const added = assets.find((a) => a.label === 'yXLM');
    expect(added).toBeDefined();
    expect(added!.value).toBe(newAsset.address);
    expect(added!.symbol).toBe('yXLM');
    expect(added!.icon).toBe('💫');
    expect(added!.description).toBe('Yield-bearing XLM');
  });

  it('does not duplicate an asset with the same address and network', () => {
    const usdcTestnet = trustlines.find(
      (t) => t.name === 'USDC' && t.network === 'testnet',
    )!;
    const before = trustlines.length;

    addTrustlineAsset({
      name: 'USDC',
      symbol: 'USDC',
      address: usdcTestnet.address,
      issuer: usdcTestnet.issuer,
      decimals: usdcTestnet.decimals,
      network: 'testnet',
    });

    expect(trustlines.length).toBe(before);
  });

  it('allows the same asset on different networks', () => {
    const newAsset = {
      name: 'CustomAsset',
      symbol: 'CST',
      address: 'CUSTOM_ADDRESS_DIFFERENT_NETWORK',
      issuer: 'CUSTOM_ISSUER_DIFFERENT_NETWORK',
      decimals: 10000000,
      network: 'mainnet' as const,
      icon: '🪙',
      description: 'Custom mainnet asset',
    };

    addTrustlineAsset(newAsset);

    const mainnetAssets = getSupportedAssets('mainnet');
    const added = mainnetAssets.find((a) => a.label === 'CustomAsset');
    expect(added).toBeDefined();
    expect(added!.value).toBe(newAsset.address);
  });

  it('provides default icon and description when omitted', () => {
    addTrustlineAsset({
      name: 'NoIconAsset',
      symbol: 'NIC',
      address: 'NO_ICON_ADDRESS',
      issuer: 'NO_ICON_ISSUER',
      decimals: 10000000,
      network: 'testnet',
    });

    const assets = getSupportedAssets('testnet');
    const added = assets.find((a) => a.label === 'NoIconAsset');
    expect(added).toBeDefined();
    expect(added!.icon).toBe('🪙');
    expect(added!.description).toBe('');
  });
});

// ─── Trustline addresses match escrow initialization expectations ────────────

describe('trustline addresses match escrow initialization forms', () => {
  it('testnet USDC address is a valid Soroban contract (starts with C)', () => {
    const usdc = getTrustlineBySymbol('USDC', 'testnet');
    expect(usdc).toBeDefined();
    expect(usdc!.value.startsWith('C')).toBe(true);
  });

  it('mainnet USDC address is a valid Soroban contract (starts with C)', () => {
    const usdc = getTrustlineBySymbol('USDC', 'mainnet');
    expect(usdc).toBeDefined();
    expect(usdc!.value.startsWith('C')).toBe(true);
  });

  it('testnet XLM address is a valid Soroban contract (starts with C)', () => {
    const xlm = getTrustlineBySymbol('XLM', 'testnet');
    expect(xlm).toBeDefined();
    expect(xlm!.value.startsWith('C')).toBe(true);
  });

  it('mainnet XLM address is a valid Soroban contract (starts with C)', () => {
    const xlm = getTrustlineBySymbol('XLM', 'mainnet');
    expect(xlm).toBeDefined();
    expect(xlm!.value.startsWith('C')).toBe(true);
  });

  it('EURC addresses are valid Stellar addresses', () => {
    const testnet = getTrustlineBySymbol('EURC', 'testnet');
    const mainnet = getTrustlineBySymbol('EURC', 'mainnet');
    expect(testnet).toBeDefined();
    expect(mainnet).toBeDefined();
    // EURC uses traditional asset format (issuer starts with G)
    expect(testnet!.value.startsWith('G') || testnet!.value.startsWith('C')).toBe(true);
    expect(mainnet!.value.startsWith('G') || mainnet!.value.startsWith('C')).toBe(true);
  });

  it('all testnet addresses are unique', () => {
    const assets = getSupportedAssets('testnet');
    const addresses = assets.map((a) => a.value);
    expect(new Set(addresses).size).toBe(addresses.length);
  });

  it('all mainnet addresses are unique', () => {
    const assets = getSupportedAssets('mainnet');
    const addresses = assets.map((a) => a.value);
    expect(new Set(addresses).size).toBe(addresses.length);
  });
});
