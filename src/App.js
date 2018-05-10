/**
 * @Author: Ali
 * @Date:   2018-05-05T17:04:42+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-10T16:52:11+02:00
 */
import React, { Component } from 'react'
import Form from './Components/Form'
import Weather from './Components/Weather'
//import AppBar from './Components/AppBar'

const API_KEY = '32941f4c12936fc51133cb69ca8f8b8a'

class App extends Component {
  constructor(){
    super()
    this.state = {
      temperature: undefined,
      city: undefined,
      country: undefined,
      humidity: undefined,
      description: undefined,
      error: undefined
    }
  }
  getWeather = async (e) => {
    e.preventDefault()
    const city = e.target.elements.city.value
    const country = e.target.elements.country.value
    const api_call = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`)

    const data = await api_call.json()
     if(data.main) {
      console.log(data)
      this.setState({
        temperature: data.main.temp,
        city: data.name,
        country: data.sys.country,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        error: ''
      })
    }
    else if(data.cod){
      this.setState({
        temperature: undefined,
        city: undefined,
        country: undefined,
        humidity: undefined,
        description: undefined,
        error: 'City not Found'
      })
    }
  }
  render() {
    return (
      <div className="col-xs-7 form-container">
        <Form getWeather={this.getWeather} />
        <Weather
          temperature={this.state.temperature}
          humidity={this.state.humidity}
          city={this.state.city}
          country={this.state.country}
          description={this.state.description}
          error={this.state.error}
        />

      </div>
    )
  }
}
export default App
