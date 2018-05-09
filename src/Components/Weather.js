/**
 * @Author: Ali
 * @Date:   2018-05-05T19:41:09+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-09T13:30:07+02:00
 */
import React, { Component} from 'react'

const Weather = props => (
  <div className="w">
    { props.city && props.country && <p> Location: {props.city},country </p> }
    { props.temperature && <p> Temperature:  {props.temperature} </p>}
    { props.humidity && <p> Humidity:{props.humidity} </p>}
    { props.description && <p> Condition:{props.description} </p>}
    { props.error && <p> {props.error} </p>}
  </div>
)

export default Weather
