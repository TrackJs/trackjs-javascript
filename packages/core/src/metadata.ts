import { truncate } from "./utils";

const MAX_METADATA_LENGTH = 500;

export class Metadata {

  private store: Map<string, string> = new Map();

  constructor(metadata?: Record<string, string>) {
    if (metadata) {
      this.add(metadata);
    }
  }

  public add(metadata: Record<string, string>): void {
    for (const [key, value] of Object.entries(metadata)) {
      this.store.set(truncate(`${key}`, MAX_METADATA_LENGTH), truncate(`${value}`, MAX_METADATA_LENGTH));
    }
  }

  public remove(metadata: Record<string, any>): void {
    for (const key of Object.keys(metadata)) {
      this.store.delete(key);
    }
  }

  public get(): Array<{ key: string, value: string }> {
    return Array.from(this.store.entries()).map(([key, value]) => ({ key, value }));
  }

  public clone(): Metadata {
    const cloned = new Metadata();
    for (const [key, value] of this.store.entries()) {
      cloned.store.set(key, value);
    }
    return cloned;
  }

}