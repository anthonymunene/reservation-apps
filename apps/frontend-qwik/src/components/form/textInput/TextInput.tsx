import {
  component$,
  useSignal,
  useTask$,
  type PropFunction,
  type QwikChangeEvent,
  type QwikFocusEvent,
} from '@builder.io/qwik';
import clsx from 'clsx';
import { InputError } from '../inputError/InputError';
import { InputLabel } from '../inputLabel/InputLabel';

type TextInputProps = {
  ref: PropFunction<(element: Element) => void>;
  type: 'text' | 'email' | 'tel' | 'password' | 'url' | 'number' | 'date';
  name: string;
  value: string | number | undefined;
  onInput$: PropFunction<(event: Event, element: HTMLInputElement) => void>;
  onChange$: PropFunction<(event: QwikChangeEvent<HTMLInputElement>, element: HTMLInputElement) => void>;
  onBlur$: PropFunction<(event: QwikFocusEvent<HTMLInputElement>, element: HTMLInputElement) => void>;
  placeholder?: string;
  required?: boolean;
  class?: string;
  label?: string;
  error?: string;
  form?: string;
};

/**
 * Text input field that users can type into. Various decorations can be
 * displayed in or around the field to communicate the entry requirements.
 */
export const TextInput = component$(({ label, value, error, ...props }: TextInputProps) => {
  const { name, required } = props;
  const input = useSignal<string | number>();
  useTask$(({ track }) => {
    if (!Number.isNaN(track(() => value))) {
      input.value = value;
    }
  });
  return (
    <div class={clsx('px-8 lg:px-10', props.class)}>
      <InputLabel name={name} label={label} required={required} />
      <div class="mt-2">
        <input
          {...props}
          class={clsx(
            'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
            error
              ? 'focus:ring-inset focus:ring-red-500 '
              : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50'
          )}
          id={name}
          value={input.value}
          aria-invalid={!!error}
          aria-errormessage={`${name}-error`}
        />
      </div>
      <InputError name={name} error={error} />
    </div>
  );
});
