/**
 * @Author: Ali
 * @Date:   2018-05-05T19:41:09+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-09T12:47:58+02:00
 */
import React, { Component} from 'react'
class Weather extends Component {
  render(){
    return (
      <div className="w">
        {this.props.temperature}
        {this.props.humidity}
        {this.props.description}
      </div>
    )
  }
}
export default Weather
