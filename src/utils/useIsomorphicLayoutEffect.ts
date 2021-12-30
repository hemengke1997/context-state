import { useEffect, useLayoutEffect } from 'react';

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
// subscription callback always has the selector from the latest render commit
// available, otherwise a store update may happen between render and the effect,
// which may cause missed updates; we also must ensure the store subscription
// is created synchronously, otherwise a store update may occur before the
// subscription is created and an inconsistent state may be observed

// React当前在服务器上使用useLayoutEffect时抛出警告。
// 要解决这个问题，我们可以有条件地在服务器上使用Effect(无操作)，并在浏览器中使用LayoutEffect。
// 我们需要useLayoutEffect来确保存储订阅回调始终具有来自最新呈现提交的选择器，
// 否则在呈现和效果之间可能会发生存储更新，这可能会导致错过更新；
// 我们还必须确保同步创建存储订阅，否则在创建订阅之前可能会发生存储更新，并且可能会观察到不一致的状态

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? useLayoutEffect
    : useEffect;

export default useIsomorphicLayoutEffect;
