interface GatewayConfig {
  url: string;
  timeout: number;
}

const TIMEOUT = 10000;

export const gatewayConfigs = {
  user: {
    url: process.env.USER_SERVICE_URL ?? 'http://localhost:3000',
    timeout: TIMEOUT,
  },
  product: {
    url: process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:3002',
    timeout: TIMEOUT,
  },
  checkout: {
    url: process.env.CHECKOUT_SERVICE_URL ?? 'http://localhost:3003',
    timeout: TIMEOUT,
  },
  payment: {
    url: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3004',
    timeout: TIMEOUT,
  },
} satisfies Record<string, GatewayConfig>;