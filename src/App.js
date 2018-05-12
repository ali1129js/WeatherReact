/**
 * @Author: Ali
 * @Date:   2018-05-05T17:04:42+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-12T20:42:04+02:00
 */
import React, { Component } from 'react'
import MyModal from './Components/MyModal'
import AppBar from './Components/AppBar'

const API_KEY = '32941f4c12936fc51133cb69ca8f8b8a'

class App extends Component {
  constructor(){
    super()
    this.state = {
      isOpen: false,
      temperature: undefined,
      city: undefined,
      country: undefined,
      humidity: undefined,
      description: undefined,
      error: undefined
    }

    this.newCity = React.createRef()
    this.newCountry = React.createRef()
  }

  getWeather = async (e) => {
    e.preventDefault()
    const api_call = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${this.newCity.current.value},${this.newCountry.current.value}&appid=${API_KEY}&units=metric`)
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
      <div className="conatiner">
        <AppBar
          getWeather={this.getWeather}
          newCity = {this.newCity}
          newCountry = {this.newCountry}
        />
        <MyModal
          show={this.state.isOpen}
          onClose={this.toggleModal}
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
/*
const city = e.target.elements.city.value
const country = e.target.elements.country.value
*/
