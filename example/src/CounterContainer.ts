import React  from 'react';
import { createContainer, useMemoizedFn } from 'context-state';

function useCounter(initialState?: {
  v: number;
  setV: React.Dispatch<React.SetStateAction<number>>
}) {



  const [count, setCount] = React.useState(0);

  const [other, setOther] = React.useState('x');

  const increment = useMemoizedFn(() => {
    setCount((n) => n + 1);
  });

  return {
    count,
    increment,
    other,
    setOther,
    initialState
  };
}

const CounterContainer = createContainer(useCounter);

export default CounterContainer;
