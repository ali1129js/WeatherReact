/**
 * @Author: Ali
 * @Date:   2018-05-05T19:41:09+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-09T16:00:21+02:00
 */
import React from 'react'

const Weather = props => (
  <div>
    { props.city && props.country && <p> Location: {props.city},{props.country} </p> }
    { props.temperature && <p> Temperature:  {props.temperature} </p>}
    { props.humidity && <p> Humidity:{props.humidity} </p>}
    { props.description && <p> Condition:{props.description} </p>}
    { props.error && <p> {props.error} </p>}
  </div>
)

export default Weather
