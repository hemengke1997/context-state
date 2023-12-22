import CounterContainer from '../../Counter'

export default function B() {
  const { count2, setCount2 } = CounterContainer.usePicker(['count2', 'setCount2'])
  return (
    <div>
      <span>{count2}</span>
      <button type='button' onClick={() => setCount2((s) => s + 1)}>
        ADD2
      </button>
    </div>
  )
}
