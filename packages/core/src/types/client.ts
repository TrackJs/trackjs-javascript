import { Transport } from './transport';
import { ErrorPayload } from './payload';
import { SerializeOptions } from '../utils/serialize';

export interface ClientOptions {
  token: string;
  url: string;
  application?: string;
  userId?: string;
  version?: string;
  enabled?: boolean;
  dedupe?: boolean;
  telemetryLimit?: number;
  transport: Transport;
  onError?: (payload: ErrorPayload) => void;
  getContext?: () => Record<string, unknown>;
  serialize?: (value: any, options?: SerializeOptions) => string;
}