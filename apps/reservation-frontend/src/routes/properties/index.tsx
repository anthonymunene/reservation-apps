import { component$, Resource } from "@builder.io/qwik";
import { RequestHandler, useEndpoint } from "@builder.io/qwik-city";

export default component$(() => {
  const propertyData = useEndpoint<typeof onGet>();

  return (
    <div>
      <Resource
        value={propertyData}
        onResolved={(propertys) => {
          return (
            <>
              <ul>
                {propertys.data.map((property) => (
                  <li>
                    <div>
                      <p><img src={`images/properties/${property.defaultImage}`} /></p>
                    </div>
                    <div>
                      <p>{property.title}</p>
                    </div>
                    <div>
                      <p>{property.description} </p>
                    </div>
                    <div>
                      <p>{property.city}</p>
                    </div>
                    <div>
                      <p>{property.country}</p>
                    </div>
                    <div>
                      <p>{property.bedrooms}</p>
                    </div>
                    <div>
                      <p>{property.beds}</p>
                    </div>
                    <div>
                      <p>{property.baths}</p>
                    </div>
                    <div>
                      <ul>
                        {property.amenities.map((amenity) => (
                          <li>
                            <p>{amenity}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p>{property.bedrooms}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          );
        }}
      />
    </div>
  );
});

export const onGet: RequestHandler<EndpointData> = async () => {
  try {
    const properties = await fetch("http://localhost:3030/properties").then(
      (response) => response.json()
    );
    return properties;
  } catch (error) {
    console.log(error);
  }
};

interface property {
  id: number;
  title: string;
  description: string;
  city: string;
  country: string;
  bedrooms: number;
  beds: number;
  baths: number;
  entirePlace: boolean;
  defaultImage: string;
  amenities: Array<string>;
}

interface EndpointData {
  total: number;
  skip: number;
  limit: number;
  data: Array<property>;
}
