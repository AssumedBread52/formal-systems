import styled, { CSSProperties } from 'styled-components';
import { layout, LayoutProps } from 'styled-system';

export const Select = styled.select<{
  cursor: CSSProperties['cursor'];
} | LayoutProps>`
  cursor: pointer;
  ${layout};
`;
