import { ApiError } from "@/lib/fetcher";

export function getApiErrorFieldNames(error: ApiError): Set<string> {
  const names = new Set<string>();

  for (const fieldError of error.fieldErrors ?? []) {
    const field = fieldError.loc[fieldError.loc.length - 1];
    if (typeof field === "string") {
      names.add(field);
    }
  }

  return names;
}
