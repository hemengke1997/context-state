import { ContextType } from '..';

class ContextCache<Value> {
  protected cache: ContextType<Value> | undefined;
  private static instance: ContextCache<any> | undefined = undefined;

  private constructor(c?: ContextType<Value>) {
    this.cache = c;
  }

  public static getInstance<Value>() {
    if (!this.instance) {
      this.instance = new ContextCache<Value>();
    }
    return this.instance as ContextCache<Value>;
  }

  getCache() {
    return this.cache;
  }

  setCache(c: ContextType<Value>) {
    this.cache = c;
  }
}

export default ContextCache;
