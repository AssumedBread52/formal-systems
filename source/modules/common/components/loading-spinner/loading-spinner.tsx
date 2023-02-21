import { Box } from '@/common/components/box/box';
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

export const LoadingSpinner = (): ReactElement => {
  return (
    <RotatingBox height='3' width='3' borderX='horizontal' borderY='vertical' borderRadius='circular' mx='auto' />
  );
};
