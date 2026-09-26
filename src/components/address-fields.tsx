import { useMemo, useState } from "react";
import { BD_DISTRICTS, upazilasFor } from "@/lib/bd-geo";

/**
 * Structured Bangladesh delivery address: street/area text + district (জেলা)
 * and upazila/thana (থানা) dropdowns with English + Bengali names.
 * Composes a single `address` value for the order form via a hidden input.
 */
export function AddressFields({
  idPrefix,
  error,
}: {
  idPrefix: string;
  error?: string | undefined;
}) {
  const [districtId, setDistrictId] = useState("");
  const [upazilaName, setUpazilaName] = useState("");
  const [street, setStreet] = useState("");

  const district = BD_DISTRICTS.find((d) => d.id === districtId);
  const upazilas = useMemo(() => upazilasFor(districtId), [districtId]);
  const upazila = upazilas.find((u) => u.name === upazilaName);

  const composed =
    district && upazila && street.trim().length >= 3
      ? `${street.trim()}, ${upazila.name} / ${upazila.bn}, ${district.name} / ${district.bn}`
      : "";

  const selectClass =
    "field mt-3 w-full appearance-none bg-surface pr-8 cursor-pointer";

  return (
    <div>
      <label htmlFor={`${idPrefix}-street`} className="eyebrow">
        Delivery address
      </label>
      <input
        id={`${idPrefix}-street`}
        maxLength={200}
        className="field mt-3"
        placeholder="House, road, area (e.g. House 12, Road 5, Dhanmondi)"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        autoComplete="street-address"
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <select
            id={`${idPrefix}-district`}
            aria-label="District (জেলা)"
            className={selectClass}
            value={districtId}
            onChange={(e) => {
              setDistrictId(e.target.value);
              setUpazilaName("");
            }}
          >
            <option value="" disabled>
              District / জেলা
            </option>
            {BD_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} / {d.bn}
              </option>
            ))}
          </select>
          <Chevron />
        </div>

        <div className="relative">
          <select
            id={`${idPrefix}-upazila`}
            aria-label="Upazila / Thana (থানা)"
            className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-50`}
            value={upazilaName}
            disabled={!districtId}
            onChange={(e) => setUpazilaName(e.target.value)}
          >
            <option value="" disabled>
              {districtId ? "Upazila / থানা" : "Select district first"}
            </option>
            {upazilas.map((u) => (
              <option key={`${u.districtId}-${u.name}`} value={u.name}>
                {u.name} / {u.bn}
              </option>
            ))}
          </select>
          <Chevron />
        </div>
      </div>

      <input type="hidden" name="address" value={composed} />
      {error && <p className="mt-2 text-xs text-primary">{error}</p>}
    </div>
  );
}

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 mt-1.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
