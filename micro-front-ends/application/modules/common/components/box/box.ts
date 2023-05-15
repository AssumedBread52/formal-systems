import { theme } from '@/app/constants';
import styled, { CSSProperties } from 'styled-components';
import { borders, BordersProps, color, ColorProps, layout, LayoutProps, position, PositionProps, shadow, ShadowProps, space, SpaceProps, system } from 'styled-system';

export const Box = styled.div<{
  cursor: CSSProperties['cursor'];
  transition: keyof typeof theme.transitions;
} | BordersProps | ColorProps | LayoutProps | PositionProps | ShadowProps | SpaceProps>`
  ${borders};
  ${color};
  ${layout};
  ${position};
  ${shadow};
  ${space};
  ${system({
    cursor: true,
    transition: {
      property: 'transition',
      scale: 'transitions'
    }
  })};
`;
