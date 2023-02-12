import Link from 'next/link';
import styled from 'styled-components';
import { color, ColorProps } from 'styled-system';

export const HyperLink = styled(Link)<ColorProps>`
  ${color};
`;
