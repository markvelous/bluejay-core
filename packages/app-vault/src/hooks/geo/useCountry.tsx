import { useFetch } from "use-http";

interface GeoIpResponse {
  city: string;
  country_code: string;
  country_name: string;
  ip: string;
}

type CountryState =
  | {
      state: "LOADING";
    }
  | {
      state: "ERROR";
      message: string;
    }
  | { state: "SUCCESS"; data: GeoIpResponse };

export const useCountry = (): CountryState => {
  const { loading, error, data } = useFetch<GeoIpResponse>("https://freegeoip.app/json/", {}, []);

  if (loading) return { state: "LOADING" };
  if (error) return { state: "ERROR", message: error.message };
  if (!data) return { state: "ERROR", message: "No data returned" };
  return {
    state: "SUCCESS",
    data,
  };
};

type AllowCountriesState =
  | {
      state: "LOADING";
    }
  | {
      state: "ALLOWED";
    }
  | {
      state: "DENIED";
    }
  | { state: "UNKNOWN" };

const DENY_LIST = ["SG", "US", "AF", "CF", "CG", "CD", "KP", "IR", "LY", "ML", "SO", "SD", "YE"];

export const useAllowedContries = (): AllowCountriesState => {
  const countryState = useCountry();
  if (countryState.state === "LOADING") return { state: "LOADING" };
  if (countryState.state === "ERROR") return { state: "UNKNOWN" };
  return DENY_LIST.includes(countryState.data.country_code) ? { state: "DENIED" } : { state: "ALLOWED" };
};
