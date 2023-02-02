import styled from 'styled-components';
import { color, ColorProps, layout, LayoutProps, position, PositionProps, shadow, ShadowProps, space, SpaceProps } from 'styled-system';

export const Box = styled.div<ColorProps | LayoutProps | PositionProps | ShadowProps | SpaceProps>`
  ${color};
  ${layout};
  ${position};
  ${shadow};
  ${space};
`;
