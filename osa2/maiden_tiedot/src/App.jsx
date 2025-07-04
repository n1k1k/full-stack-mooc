import { useState, useEffect } from 'react'
import axios from 'axios'
import './index.css'
import ListOfCountries from './components/ListOfCounties'

const App = () => {
  const [value, setValue] = useState('')
  const [allCountries, setAllCountries] = useState([])
  const [countriesToShow, setCountriesToShow] = useState([])

  useEffect(() => {
      axios.get(`https://studies.cs.helsinki.fi/restcountries/api/all`)
      .then(response => {
        setAllCountries(response.data)
    })
  }, [])

  const handleChange = (event) => {
    const newValue = event.target.value
    const filteredCountries = allCountries.filter(country => country.name.common.toLowerCase().includes(newValue.toLowerCase()))
    
    setValue(newValue)

    if (filteredCountries.length === 1) {
      const name = filteredCountries[0].name.common
      axios.get(`https://studies.cs.helsinki.fi/restcountries/api/name/${name}`)
      .then(response => {
        setCountriesToShow([response.data])
    })
      
    } else if (filteredCountries.length < 11) {
      setCountriesToShow(filteredCountries)
    } else {
      setCountriesToShow([])
    }
  }

  return (
    <>
      <div>
        <form>
          find countries <input value={value} onChange={handleChange} />
        </form>
          <ListOfCountries countries={countriesToShow} />
      </div>
    </>
  )
}

export default App