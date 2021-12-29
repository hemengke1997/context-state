import React from 'react';
import CounterContainer from './CounterContainer';

const Initial = () => {
  const { initialState } = CounterContainer.usePicker(['initialState']);

  console.log('Initial render');

  return (
    <div>
      <span>initialState: </span>
      {initialState?.v}
      <button type="button" onClick={() => initialState?.setV((n) => n + 1)}>
        change
      </button>
    </div>
  );
};

export default React.memo(Initial);
