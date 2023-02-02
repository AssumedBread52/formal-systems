import { Box } from '@/common/components/box/box';
import styled from 'styled-components';
import { flexbox, FlexboxProps } from 'styled-system';

export const Flex = styled(Box)<FlexboxProps>`
  ${flexbox};
`;
