/**
 * @Author: Ali
 * @Date:   2018-05-05T19:41:09+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-10T19:02:06+02:00
 */
import React from 'react'
import styled from 'styled-components'
const Content = styled.div`
  background: linear-gradient(to bottom right, #3498db ,papayawhip, #f39c12);
  margin: auto;
  margin-top: 1em;
  height: 10em;
  width: 16em;
  font-size: 1.2em;
  text-align: center;
  border: 3px solid #c0392b;
  padding: 5px;
  box-shadow: 5px 10px #7f8c8d;
`
const Weather = props => (
  <Content>
    { props.city && props.country && <p> Location:
      { props.city},{ props.country} </p> }
    { props.description && <p> {props.description} </p>}
    { props.temperature && <p> Temperature:  {props.temperature}°C </p>}
    { props.humidity && <p> Humidity:{props.humidity} </p>}
    { props.error && <p> {props.error} </p>}
  </Content>
)

export default Weather
