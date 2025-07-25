export interface StackFrame {
  function?: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface ErrorPayload {
  id: string;
  message: string;
  stack?: StackFrame[];
  file?: string;
  line?: number;
  column?: number;
  timestamp: number;
  userId?: string;
  application?: string;
  version?: string;
  metadata?: Record<string, any>;
  telemetry?: TelemetryEntry[];
  context?: Record<string, unknown>;
}

export interface TelemetryEntry {
  timestamp: number;
  type: 'console' | 'network' | 'navigation' | 'user' | 'custom';
  data: Record<string, any>;
}