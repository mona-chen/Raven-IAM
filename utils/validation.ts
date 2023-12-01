/**
 * Validator class for validating data.
 */
class Validator {
  private data: Record<string, any>;
  private errors: string[];

  constructor() {
    this.data = {};
    this.errors = [];
  }

  /**
   * Creates a new Validator instance.
   */
  validate(data: Record<string, any>): this {
    this.data = data;
    this.errors = [];
    return this;
  }

  require(
    field: string,
    secondArg:
      | string
      | {
          message?: string;
          type?: string;
          minValue?: number;
          minLength?: number;
          maxLength?: number;
          maxValue?: number;
        }
      | null = null
  ): this {
    let message: string | null = null;
    let type: string | null = null;
    let minValue: number | null = null;
    let minLength: number | null = null;
    let maxLength: number | null = null;
    let maxValue: number | null = null;

    if (typeof this.data !== "object") {
      this.errors.push("Empty or invalid request parameters");
    }

    if (secondArg && typeof secondArg === "string") {
      message = secondArg;
    } else if (secondArg && typeof secondArg === "object") {
      message = secondArg.message || null;
      type = secondArg.type || null;
      minValue = secondArg.minValue || null;
      minLength = secondArg.minLength || null;
      maxLength = secondArg.maxLength || null;
      maxValue = secondArg.maxValue || null;
    }

    if (this.data[field] === undefined || this.data[field] === "") {
      this.errors.push(`${field} is required`);
    } else if (type && typeof this.data[field] !== type) {
      let errorMessage = message || `${field} must be a ${type}`;
      this.errors.push(errorMessage);
    } else if (minValue !== null && this.data[field] < minValue) {
      this.errors.push(`${field} must be greater than or equal to ${minValue}`);
    } else if (
      minLength !== null &&
      (typeof this.data[field] !== "string" ||
        this.data[field]?.length < minLength)
    ) {
      this.errors.push(
        `${field} must be at least ${minLength} characters long`
      );
    } else if (
      maxLength !== null &&
      (typeof this.data[field] !== "string" ||
        this.data[field]?.length > maxLength)
    ) {
      this.errors.push(
        `${field} must be less than or equal to ${maxLength} characters long`
      );
    } else if (maxValue !== null && this.data[field] > maxValue) {
      this.errors.push(`${field} must be less than or equal to ${maxValue}`);
    }

    return this;
  }

  email(field: string, message = `${field} is not a valid email`): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.data[field])) {
      this.errors.push(message);
    }
    return this;
  }

  enum(
    field: string,
    allowedValues: any[],
    message = `${field} must be one of ${allowedValues.join(", ")}`
  ): this {
    if (!allowedValues.includes(this.data[field])) {
      this.errors.push(message);
    }
    return this;
  }

  minLength(
    field: string,
    length: number,
    message = `${field} must be at least ${length} characters`
  ): this {
    if (
      typeof this.data[field] !== "string" ||
      this.data[field]?.length < length
    ) {
      this.errors.push(message);
    }
    return this;
  }

  maxLength(
    field: string,
    length: number,
    message = `${field} cannot exceed ${length} characters`
  ): this {
    if (
      typeof this.data[field] !== "string" ||
      this.data[field]?.length > length
    ) {
      this.errors.push(message);
    }
    return this;
  }

  phone(field: string, message = `${field} is not a valid phone number`): this {
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(this.data[field])) {
      this.errors.push(message);
    }
    return this;
  }

  password(
    field: string,
    message = `${field} does not meet password criteria`
  ): this {
    const password = this.data[field];
    if (!password || password === "") {
      this.errors.push(`${field} is required`);
    } else {
      const errors: string[] = [];
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("Password must include an uppercase letter");
      }
      if (!/[a-z]/.test(password)) {
        errors.push("Password must include a lowercase letter");
      }
      if (!/\d/.test(password)) {
        errors.push("Password must include a digit");
      }
      if (!/[!@#\$%\^&*()_+{}\[\]:;<>,.?~\\\-]/.test(password)) {
        errors.push("Password must include a special character");
      }
      if (errors.length > 0) {
        this.errors.push(`${field}: ${errors.join(", ")}`);
      }
    }
    return this;
  }

  number(field: string, message = `${field} must be a number`): this {
    if (typeof this.data[field] !== "number") {
      this.errors.push(message);
    }
    return this;
  }

  integer(field: string, message = `${field} must be an integer`): this {
    if (!Number.isInteger(this.data[field])) {
      this.errors.push(message);
    }
    return this;
  }

  minValue(
    field: string,
    minValue: number,
    message = `${field} must be greater than or equal to ${minValue}`
  ): this {
    if (this.data[field] < minValue) {
      this.errors.push(message);
    }
    return this;
  }

  maxValue(
    field: string,
    maxValue: number,
    message = `${field} must be less than or equal to ${maxValue}`
  ): this {
    if (this.data[field] > maxValue) {
      this.errors.push(message);
    }
    return this;
  }

  custom(
    func: (data: Record<string, any>) => boolean,
    message = `validation failed`
  ): this {
    if (!func(this.data)) {
      this.errors.push(message);
    }
    return this;
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  getErrors(): string[] {
    return this.errors;
  }

  end(): void {
    if (!this.isValid()) {
      const errorMessage = this.getErrors().join(", ");
      const validationError: any = new Error(errorMessage);
      validationError.isValidationError = true; // Add a custom property
      throw validationError;
    }
  }
}

export = Validator;
