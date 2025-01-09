import { PropertyType } from "@database-generated-types/knex-db"

export interface PropertyTypesData extends Pick<PropertyType, "id" | "name"> {}
export interface PropertyTypesId extends Pick<PropertyType, "id"> {}
