import { Flex } from '@/common/components/flex/flex';
import styled from 'styled-components';
import { grid, GridProps } from 'styled-system';

export const Grid = styled(Flex)<GridProps>`
  ${grid};
`;
