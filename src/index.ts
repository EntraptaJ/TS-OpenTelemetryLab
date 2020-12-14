/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/index.ts
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/metrics';
import got from 'got';

const meterProvider = new MeterProvider({
  // The Prometheus exporter runs an HTTP server which
  // the Prometheus backend scrapes to collect metrics.
  exporter: new PrometheusExporter({
    port: 9000,
  }),
  interval: 2500,
});

const meter = meterProvider.getMeter('hello-worldd');

meter.createValueObserver(
  'your_metric_name',
  {
    description: 'Example of an async observer with callback',
  },
  async (observerResult) => {
    const gatewayInfos = await getGWInfo();

    const WANGW = gatewayInfos.find(({ name }) => name === 'WAN_DHCP');
    if (!WANGW?.delay) {
      throw new Error('GW Invalid');
    }

    observerResult.observe(WANGW.delay, { label: '1' });
  },
);

const Authorization = Buffer.from(
  'XnxnIcoNqJpwRL2pMbdg7W1AC+VSpDR/LYmcqDw9cPXRrgXKvVQsVFyoSDsK4z8IBrXV4a90VAvg5Vte:wJWdCLJ9XhUSbMOODLcrPipkus2ENZeWPO1OlCkcE2Bp2XkcD+Hq9vjfMd3HsHbwENmfcVUDmRxLzX9H',
);

interface GatewayItem {
  name: string;

  address: string;

  status: 'none' | string;

  loss: string;

  delay: string;

  stddev: string;

  // eslint-disable-next-line camelcase
  status_translated: string;
}

interface Body {
  items: GatewayItem[];
}

function isBody(body: any): body is Body {
  return 'items' in body;
}

interface GatewayInfo {
  name: string;

  delay: number | null;
}

async function getGWInfo(): Promise<GatewayInfo[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const apiRequest = await got.get(
    'https://fw1.office1.kristianjones.dev/api/routes/gateway/status',
    {
      headers: {
        Authorization: `Basic ${Authorization.toString('base64')}`,
      },

      responseType: 'json',
    },
  );

  const apiBody = apiRequest.body;

  if (isBody(apiBody)) {
    const WAN = apiBody.items.find(({ name }) => name === 'WAN_DHCP');
    if (!WAN) {
      throw new Error();
    }

    return apiBody.items.map(({ delay: delayString, name }) => {
      const GWDelayArray = delayString.split(' ms');

      let delay: number | null;

      if (GWDelayArray.length > 0) {
        delay = parseFloat(GWDelayArray[0]);
      } else {
        delay = null;
      }

      return {
        name,
        delay,
      };
    });
  }

  throw new Error('Error fetching Gateways');
}

console.log(`Starting TS-Core`);

export {};
