"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, compactSelectClasses } from "@/components/ui";

/** Inline "pick one and add" form, used to add a person to a team or a team to a person. */
export function AddPicker({
  id,
  label,
  placeholder,
  options,
  onAdd,
}: {
  id: string;
  /** Screen-reader label for the select. */
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  /** Resolves true when added; the picker only clears on success. */
  onAdd: (value: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="flex gap-2 mt-2.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (value) onAdd(value).then((added) => added && setValue(""));
      }}
    >
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        className={`${compactSelectClasses} flex-1 min-w-0`}
        id={id}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={!value}>
        <Plus size={14} />
        Add
      </Button>
    </form>
  );
}
