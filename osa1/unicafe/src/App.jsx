import { useState } from 'react'

const Button = ({ onClick, text }) => {
  return (
    <button onClick={onClick}>
      {text}
    </button>
  )
}

const StatisticLine = ({ text, value}) => {
  return <p>{text} {value}</p>
}

const Average = ({ total, all }) => {
  if (all === 0) {
    return <p>average 0</p>
  }
  return <p>average {total / all}</p>
}

const Positive = ({ good, all }) => {
  if (all === 0) {
    return <p>positive 0 %</p>
  }
  return <p>positive {good / all * 100} %</p>
}

const Statistics = ({ good, neutral, bad, all, total }) => {
  if (all === 0) {
    return <p>No feedback given</p>
  }
  return (
    <div>
      <StatisticLine text='good' value={good} />
      <StatisticLine text='neutral' value={neutral} />
      <StatisticLine text='bad' value={bad} />
      <StatisticLine text='all' value={all} />
      <Average total={total} all={all} />
      <Positive good={good} all={all} />
    </div>
  )
}

const App = () => {
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)
  const [all, setAll] = useState(0)
  const [total, setTotal] = useState(0)

  const handleGoodClick = () => {
    setGood(good + 1)
    setAll(all + 1)
    setTotal(total + 1)
  }

  const handleNeutralClick = () => {
    setNeutral(neutral + 1)
    setAll(all + 1)
  }

  const handleBadClick = () => {
    setBad(bad + 1)
    setAll(all + 1)
    setTotal(total - 1)
  }

  return (
    <div>
      <h1>Give Feedback</h1>
      <Button onClick={handleGoodClick} text='good' />
      <Button onClick={handleNeutralClick} text='neutral' />
      <Button onClick={handleBadClick} text='bad' />

      <h1>Statistics</h1>
      <Statistics good={good} neutral={neutral} bad={bad} all={all} total={total}/>
    </div>
  )
}

export default App