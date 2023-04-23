import { Box } from '@/common/components/box/box';
import { Select } from '@/common/components/select/select';
import { NumericSelectFieldProps } from '@/common/types';
import { FormEvent, Fragment, ReactElement } from 'react';

export const NumericSelectField = (props: NumericSelectFieldProps): ReactElement => {
  const { label, total, interval, optionCount, value, setValue } = props;

  const inputHandler = (event: FormEvent<HTMLSelectElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setValue(parseInt(event.currentTarget.value));
  };

  const lowerCaseLabel = label.toLowerCase();

  const options = Array.from({
    length: optionCount
  }, (_: unknown, index: number): number => {
    return (index + 1) * interval;
  });

  return (
    <Fragment>
      <label htmlFor={lowerCaseLabel}>
        {label}
      </label>
      <Box mx='1' />
      <Select id={lowerCaseLabel} name={lowerCaseLabel} disabled={2 > options.length || 0 === total} minWidth='4' value={value} onInput={inputHandler}>
        {options.map((option: number): ReactElement => {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        })}
      </Select>
    </Fragment>
  );
};
