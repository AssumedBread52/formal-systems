import { Box } from '@/common/components/box/box';
import styled from 'styled-components';
import { grid, GridProps } from 'styled-system';

export const Grid = styled(Box)<GridProps>`
  ${grid};
`;
