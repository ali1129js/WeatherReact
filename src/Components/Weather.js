/**
 * @Author: Ali
 * @Date:   2018-05-05T19:41:09+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-09T13:21:15+02:00
 */
import React, { Component} from 'react'
class Weather extends Component {
  render(){
    const {city,country,temperature,humidity,description,error} = this.props
    //we'll use the AND &&  operator
    return (
      <div className="w">
        { city && country && <p> Location: {city},country </p> }
        { temperature && <p> Temperature:  {temperature} </p>}
        { humidity && <p> Humidity:{humidity} </p>}
        { description && <p> Condition:{this.props.description} </p>}
        { error && <p> {error} </p>}
      </div>
    )
  }
}
export default Weather
