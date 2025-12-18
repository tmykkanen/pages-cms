import { z } from "zod";
import { Field } from "@/types/field";
import { EditComponent } from "./edit-component";

// Import bcv_parser to parse scripture reference
import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser.js";
import * as lang from "bible-passage-reference-parser/esm/lang/en.js";
const bcv = new bcv_parser(lang);
bcv.set_options({
  book_alone_strategy: "full",
});

import formatOsis from "./utils/en";

const write = (value: any, field: Field) => {
  const osis = bcv.parse(value).osis();

  if (osis.length > 0) {
    return osis;
  } else {
    console.warn(
      `Invalid scripture reference for field ${field.name}: "${value}"`,
    );
    return "";
  }
};

const read = (value: any, field: Field) => {
  if (!value) return "";

  // Parse to osis first in case .md scripture ref was directly edited
  const osis = bcv.parse(value).osis();
  const readable = formatOsis("esv-long", osis);

  if (osis.length > 0) {
    return readable;
  } else {
    console.warn(
      `Invalid scripture reference for field ${field.name}: "${value}"`,
    );
    return "";
  }
};

const schema = (field: Field, configObject?: Record<string, any>) => {
  let zodSchema = z
    .string()

    // Check for required
    .refine((val) => (field.required ? val : true), "Field is required")

    // Check for valid scripture reference
    .refine(
      (val) => bcv.parse(val).osis().length > 0,
      "Please enter a valid scripture reference",
    );

  return zodSchema;
};

const label = "Scripture";

export { label, schema, EditComponent, write, read };
