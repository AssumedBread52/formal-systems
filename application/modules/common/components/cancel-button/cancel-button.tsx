import { Button } from '@/common/components/button/button';
import { useRouter } from 'next/router';
import { MouseEvent, ReactElement } from 'react';

export const CancelButton = (): ReactElement => {
  const { back } = useRouter();

  const clickHandler = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    back();
  };

  return (
    <Button title='Go back' fontSize='formButton' height='3' width='5' onClick={clickHandler}>
      Cancel
    </Button>
  );
};
