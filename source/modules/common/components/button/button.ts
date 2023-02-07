import styled, { CSSProperties } from 'styled-components';
import { space, SpaceProps, system, typography, TypographyProps } from 'styled-system';

export const Button = styled.button<{
  cursor: CSSProperties['cursor'];
} | SpaceProps | TypographyProps>`
  ${space};
  ${typography};
  ${system({
    cursor: true
  })};
`;
