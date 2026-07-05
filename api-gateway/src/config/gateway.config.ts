interface GatewayConfig {
  url: string;
  timeout: number;
}

interface Gateways {
  users: GatewayConfig;
  products: GatewayConfig;
  checkouts: GatewayConfig;
  payments: GatewayConfig;
}

const TIMEOUT = 10000;

export const gatewayConfigs = {
  users: {
    url: process.env.USER_SERVICE_URL ?? 'http://localhost:3000',
    timeout: TIMEOUT,
  },
  products: {
    url: process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:3002',
    timeout: TIMEOUT,
  },
  checkouts: {
    url: process.env.CHECKOUT_SERVICE_URL ?? 'http://localhost:3003',
    timeout: TIMEOUT,
  },
  payments: {
    url: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3004',
    timeout: TIMEOUT,
  },
} satisfies Gateways;
