/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/index.ts
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/metrics';
import { Container } from 'typedi';
import { GatewayService } from './Modules/Gateway/GatewayAPI';
import { createOPNSenseAPIController } from './Modules/OPNSense/OPNSenseAPIController';

if (process.env.NODE_ENV !== 'production') {
  const { config } = await import('dotenv');

  config();
}

console.log('Starting TS-OpenTelemetry Server');

createOPNSenseAPIController({
  url: process.env.OPNSENSE_URL,
  auth: {
    key: process.env.OPNSENSE_KEY,
    secret: process.env.OPNSENSE_SECRET,
  },
});

const gatewayAPI = Container.get(GatewayService);

const meterProvider = new MeterProvider({
  // The Prometheus exporter runs an HTTP server which
  // the Prometheus backend scrapes to collect metrics.
  exporter: new PrometheusExporter({
    port: 9000,
  }),
  interval: 2500,
});

const meter = meterProvider.getMeter('gateway-delay');

meter.createValueObserver(
  `gateway_delay`,
  {
    description: 'Monitor OPNSense Gateways',
  },
  async (observerResult) => {
    const gwInfos = await gatewayAPI.getGateways();

    gwInfos.forEach(
      ({
        name,

        delay,
      }) => {
        if (delay) {
          console.log(`${name} has a delay of ${delay}`);
          observerResult.observe(delay, { gateway: name });
        }
      },
    );
  },
);

export {};
