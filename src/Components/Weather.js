/**
 * @Author: Ali
 * @Date:   2018-05-05T19:41:09+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-06T18:57:07+02:00
 */
import React, { Component} from 'react'
class Weather extends Component {
  render(){
    return (
      <div className="w">
        temperature:  {this.props.temperature}
        humidity:  {this.props.humidity}
        {this.props.description}
      </div>
    )
  }
}
export default Weather
