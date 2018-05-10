/**
 * @Author: Ali
 * @Date:   2018-05-05T19:41:09+02:00
 * @Last modified by:   Ali
 * @Last modified time: 2018-05-10T19:45:55+02:00
 */
import React from 'react'
import styled from 'styled-components'
const Content = styled.div`
  background: linear-gradient(to bottom right, #3498db ,papayawhip, #f39c12);
  margin: auto;
  margin-top: 1em;
  height: 12em;
  width: 12em;
  font-size: 1.2em;
  text-align: center;
  border: 3px solid #c0392b;
  padding: 5px;
  padding-top: 10px;
  box-shadow: 8px 10px #7f8c8d;
`
const Weather = props => (
  <Content>
    { props.city && props.country && <p> Location:
      { props.city},{ props.country} </p> }
    { props.description && <p><i><b> {props.description}</b></i></p>}
    { props.temperature && <p> Temperature: <strong>{props.temperature}</strong>°C </p>}
    { props.humidity && <p> Humidity:{props.humidity} </p>}
    { props.error && <p> {props.error} </p>}
  </Content>
)

export default Weather
