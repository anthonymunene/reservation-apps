import { component$ } from '@builder.io/qwik';
import clsx from 'clsx';
import { type DefaultButtonProps, UnstyledButton } from './UnstyledButton';

type ActionButtonProps = DefaultButtonProps & {
  variant: 'primary' | 'secondary';
  label: string;
};

/**
 * Button that is used for navigation, to confirm form entries or perform
 * individual actions.
 */
export const ActionButton = component$(({ label, variant, ...props }: ActionButtonProps) => (
  <UnstyledButton
    class={clsx(
      'flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
      variant === 'primary' &&
        'bg-sky-600 text-white hover:bg-sky-600/80 dark:bg-sky-400 dark:text-gray-900 dark:hover:bg-sky-400/80',
      variant === 'secondary' &&
        'bg-sky-600/10 text-sky-600 hover:bg-sky-600/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/20'
    )}
    {...props}
  >
    {label}
  </UnstyledButton>
));
