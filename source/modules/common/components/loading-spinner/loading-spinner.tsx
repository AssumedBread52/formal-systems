import { Box } from '@/common/components/box/box';
import { LoadingSpinnerProps } from '@/common/types';
import { ReactElement } from 'react';
import styled, { keyframes } from 'styled-components';

const rotationKeyFrames = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const RotatingBox = styled(Box)`
  animation: ${rotationKeyFrames} 1s infinite linear;
`;

export const LoadingSpinner = (props: LoadingSpinnerProps): ReactElement => {
  const { size } = props;

  const sizeInUnits = `${size}rem`;
  const borderX = `${size}px black solid`;
  const borderY = `${size}px rgba(0, 0, 0, 0.25) solid`;

  return (
    <RotatingBox height={sizeInUnits} width={sizeInUnits} borderX={borderX} borderY={borderY} borderRadius='50%' mx='auto' />
  );
};
