import React, { useState } from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ToggleSwitch = styled.div`
  width: 50px;
  height: 22px;
  border-radius: 25px;
  background-color: ${(props) => (props.isOn ? '#065F46' : '#FF0051')};
  position: relative;
  transition: background-color 0.3s;
`;

const ToggleKnob = styled.div`
  width: 23px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  position: absolute;
  top: 1px;
  left: ${(props) => (props.isOn ? '26px' : '1px')};
  transition: left 0.3s;
`;
const ToggleLabel = styled.span`
  margin-left: 10px;
  font-size: 14px;
  color: ${(props) => (props.isOn ? '#4CAF50' : '#FF0000')}; 
`;
const ToggleButton = ({ label,isOn,setIsOn }) => {

  const handleToggle = () => {
    setIsOn(!isOn);
  };

  return (
    <ToggleContainer onClick={handleToggle}>
      <ToggleSwitch isOn={isOn}>
        <ToggleKnob isOn={isOn} />
      </ToggleSwitch>
      {label && <ToggleLabel isOn={isOn}>{label}</ToggleLabel>}
    </ToggleContainer>
  );
};

export default ToggleButton;
