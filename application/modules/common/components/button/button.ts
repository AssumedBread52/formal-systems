import styled, { CSSProperties } from 'styled-components';
import { layout, LayoutProps, position, PositionProps, space, SpaceProps, system, typography, TypographyProps } from 'styled-system';

export const Button = styled.button<{
  cursor: CSSProperties['cursor'];
} | LayoutProps | PositionProps | SpaceProps | TypographyProps>`
  cursor: pointer;
  ${layout};
  ${position};
  ${space};
  ${typography};
  ${system({
    cursor: true
  })};
`;
