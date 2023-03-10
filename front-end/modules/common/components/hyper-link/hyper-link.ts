import Link from 'next/link';
import styled from 'styled-components';
import { color, ColorProps, typography, TypographyProps } from 'styled-system';

export const HyperLink = styled(Link)<ColorProps | TypographyProps>`
  ${color};
  ${typography};
`;
