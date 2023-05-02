import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { api } from '../../client';

export const useGetProperties = routeLoader$(async () => {
  const { data } = await api.service('properties').find();
  return data;
});

export default component$(() => {
  const properties = useGetProperties();
  return (
    <>
      <ul>
        {properties.value.map((property, key) => (
          <li key={key}>
            <p>{property.title}</p>
            <p>{property.description}</p>
          </li>
        ))}
      </ul>
    </>
  );
});

export const useFetchUsers = routeLoader$(async () => {
  try {
    const users = await fetch('http://localhost:3030/users').then(response => response.json());
    return users;
  } catch (error) {
    console.log(error);
  }
});
