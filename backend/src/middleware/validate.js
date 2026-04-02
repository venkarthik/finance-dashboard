import { errorResponse } from "../utils/response.js";

/**
 * Validates request body against a Zod schema
 * Usage: validate(schema)
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return errorResponse(res, "Validation failed.", 422, errors);
    }
    req.body = result.data; // use parsed/coerced data
    next();
  };
};