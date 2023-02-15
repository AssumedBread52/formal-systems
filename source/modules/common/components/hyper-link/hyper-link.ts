import Link from 'next/link';
import styled from 'styled-components';
import { color, ColorProps, position, PositionProps, typography, TypographyProps } from 'styled-system';

export const HyperLink = styled(Link)<ColorProps | PositionProps | TypographyProps>`
  ${color};
  ${position};
  ${typography};
`;
