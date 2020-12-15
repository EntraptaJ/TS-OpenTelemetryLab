// src/Modules/OPNSense/OPNSenseService.ts
import { Service, Container, Inject } from 'typedi';
import got from 'got';

type Got = import('got').Got;

@Service()
export class OPNSenseAPIController {
  @Inject('got-instance')
  public got: Got;
}

interface ControllerAuth {
  key: string;

  secret: string;
}

interface CreateControllerOpts {
  url: string;

  /**
   * Auth
   */
  auth: ControllerAuth;
}

export function createOPNSenseAPIController({
  auth,
  url: prefixUrl,
}: CreateControllerOpts): Got {
  const authBuffer = Buffer.from(`${auth.key}:${auth.secret}`);

  const gotInstance = got.extend({
    prefixUrl,
    headers: {
      Authorization: `Basic ${authBuffer.toString('base64')}`,
    },
    responseType: 'json',
    resolveBodyOnly: true,
  });

  Container.set('got', gotInstance);

  return gotInstance;
}
