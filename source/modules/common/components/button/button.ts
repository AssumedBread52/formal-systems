import styled, { CSSProperties } from 'styled-components';
import { layout, LayoutProps, space, SpaceProps, system, typography, TypographyProps } from 'styled-system';

export const Button = styled.button<{
  cursor: CSSProperties['cursor'];
} | LayoutProps | SpaceProps | TypographyProps>`
  cursor: pointer;
  ${layout};
  ${space};
  ${typography};
  ${system({
    cursor: true
  })};
`;
