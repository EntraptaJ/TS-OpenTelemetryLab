// src/Modules/Gateway/GatewayAPI.ts
import type { Got } from 'got';
import { Inject, Service } from 'typedi';
import { Gateway } from './Gateway';

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

interface GatewayResponse {
  items: GatewayItem[];
}

@Service()
export class GatewayService {
  @Inject('got')
  public got: Got;

  private getRequest<T>(path: string): Promise<T> {
    return this.got<T>(path.startsWith('/') ? path.replace('/', '') : path, {
      resolveBodyOnly: true,
    });
  }

  public async getGateways(): Promise<Gateway[]> {
    const response = await this.getRequest<GatewayResponse>(
      '/api/routes/gateway/status',
    );

    return response.items.map(({ delay: delayString, name }) => {
      const GWDelayArray = delayString.split(' ms');

      let delay: number | undefined;
      if (GWDelayArray.length > 0) {
        delay = parseFloat(GWDelayArray[0]);
      }

      return {
        name,
        delay,
      };
    });
  }
}
