
const ListOfCountries = ({ countries }) => {
  if (countries.length === 0) {
    return <p>Too many matches, specify another filter</p>
  }

  if (countries.length === 1) {
    const country = countries[0]
    const name = country.name.common
    const capital = country.capital
    const area = country.area
    const languages = Object.values( country.languages)
    const flag = country.flags.png

    return (
        <div>
            <h2>{name}</h2>
            <p>Capital {capital}</p>
            <p>Area {area}</p>
            <h2>Languages</h2>
            <ul>
                {languages.map(language => <li key={language}>{language}</li>)}
            </ul>
            <img src={flag} />
        </div>
    )
  }

  return (
    <div>
      {countries.map(country => <p key={country.name.common}>{country.name.common}</p>)}
    </div>
  )  
}

export default ListOfCountries