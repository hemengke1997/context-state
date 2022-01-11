import ContextCache from '../src/utils/contextCache';

describe('singleton mode', () => {
  it('singleton equal', () => {
    const A = ContextCache.getInstance();
    const B = ContextCache.getInstance();

    expect(A).toEqual(B);
  });
});
