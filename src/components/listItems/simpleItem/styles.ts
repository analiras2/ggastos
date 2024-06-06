import styled from 'styled-components/native';

export const Item = styled.View`
  flex-direction: row;
  min-height: 36px;
  margin-left: 20px;
  align-items: center;
`;

export const ColorDot = styled.View<{color: string}>`
  height: 12px;
  width: 12px;
  margin-right: 16px;
  border-width: 1px;
  border-radius: 50px;
  border-color: ${props => props.color};
  background-color: ${props => props.color};
`;
