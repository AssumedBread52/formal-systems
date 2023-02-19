import { Box } from '@/common/components/box/box';
import { Input } from '@/common/components/input/input';
import { KeywordsFieldProps } from '@/common/types';
import { FormEvent, Fragment, ReactElement, useEffect, useState } from 'react';

export const KeywordsField = (props: KeywordsFieldProps): ReactElement => {
  const { updateKeywords } = props;

  const [keywords, setKeywords] = useState<string>('');

  useEffect((): (() => void) => {
    const keywordList = keywords.trim().split(' ').filter((keyword: string): boolean => {
      return 0 !== keyword.length;
    });

    const delayedUpdate = setTimeout((): void => {
      updateKeywords(keywordList);
    }, 300);

    return (): void => {
      clearTimeout(delayedUpdate);
    };
  }, [keywords]);

  const inputHandler = (event: FormEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setKeywords(event.currentTarget.value);
  };

  return (
    <Fragment>
      <label htmlFor='keywords'>
        Search
      </label>
      <Box mx='1' />
      <Input id='keywords' type='search' width='100%' value={keywords} onInput={inputHandler} />
    </Fragment>
  );
};
