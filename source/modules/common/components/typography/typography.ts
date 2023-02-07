import { Box } from '@/common/components/box/box';
import styled from 'styled-components';
import { typography, TypographyProps } from 'styled-system';

export const Typography = styled(Box)<TypographyProps>`
  ${typography};
`;
