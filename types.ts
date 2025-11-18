export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
}

// New types for the Config Builder
export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'none';
  timestamp: boolean;
}

export interface DnsConfig {
  servers: string[];
}

export interface Inbound {
  type: 'direct' | 'http' | 'socks' | 'mixed';
  tag: string;
  listen: string;
  listen_port: number;
}

export interface Outbound {
  type: 'freedom' | 'block' | 'dns';
  tag: string;
}

export interface RouteRule {
  inbound?: string[];
  outbound: string;
}

export interface RouteConfig {
  rules: RouteRule[];
}

export interface SingboxConfig {
  log: LogConfig;
  dns: DnsConfig;
  inbounds: Inbound[];
  outbounds: Outbound[];
  route: RouteConfig;
}
