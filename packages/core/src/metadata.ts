import { truncate } from "./utils";

// The max length that the server will accept is 500. We pad this down by 10 so
// that there is room for the …{9999} to know the true length.
const MAX_METADATA_LENGTH = 490;

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